class RecordsController < ApplicationController
  before_action :set_record, only: [:update, :destroy, :like, :report]
  skip_before_action :authenticate_user!, only: [:show, :index, :report, :for_user]
  skip_after_action :verify_authorized, only: [:index, :show, :report, :for_user] #show is in here because we authorize in the method

  decorates_assigned :record, :records, with: RecordDecorator

  def index
    @records = RecordsIndex.filter(terms: {state: %w[published flagged]}).limit(500).order(created_at: :desc)
  end

  def create
    @record = current_user.records.build(record_params)
    authorize(@record)

    @result = save_record_and_return_from_es(@record)

    unless @result.present?
      render json: @record.errors, status: :unprocessable_entity
    end
  end

  def show
    if user_signed_in?
      @record = RecordsIndex.in_state(['published','draft','flagged']).filter(ids: {values: [params[:id]]}).first
    else
      @record = RecordsIndex.published.filter(ids: {values: [params[:id]]}).first
    end

    raise ActiveRecord::RecordNotFound, "Record not found" unless @record.present?
    raise Pundit::NotAuthorizedError unless RecordPolicy.new(current_user, @record).show?
    # TODO create a RecordViewJob which increments async.
    # @record.increment!(:view_count) unless cookies[:viewed_records].present? && cookies[:viewed_records].include?(@record.id)
  end

  def for_user
    raise Pundit::NotAuthorizedError unless UserRecordPolicy.new(current_user, Record).show?
    @records = RecordsIndex.user_records(
      user_id: params[:id],
      record_states: (current_user.try(:id) == params[:id].to_i) ? ['published', 'draft'] : ['published']
    )
  end

  def update
    update_record_params = record_params.to_h
    check_transition(update_record_params[:state])
    @record.assign_attributes(update_record_params)
    authorize(@record)

    @result = save_record_and_return_from_es(@record)

    if @result.present?
      return @result
    else
      render json: @record.errors, status: :unprocessable_entity
    end
                                          
  end

  def destroy
    authorize(@record)

    if @record.may_mark_as_deleted?
      @record.mark_as_deleted!
      render json: '', status: :ok
    else
      render json: @record.errors, status: :unprocessable_entity
    end
  end

  def like
    authorize(@record)
    @record.increment!(:like_count)

    current_user.record_likes << @record.id
    current_user.save if current_user.record_likes_changed?

    render json: {like_count: @record.reload.like_count}, status: 200
  end

  def report
    authorize(@record)

    user = current_user || User.find_by(email: record_report_params[:email])

    new_report_params = record_report_params.dup

    if user
      new_report_params[:user_id] = user.id
    else
      new_report_params[:email] = record_report_params[:email]
    end

    report = @record.record_reports.build(new_report_params)

    unless user || record_report_params[:email].present?
      report.errors.add(:email, "must be present")
    end

    if report.save
      render json: '', status: :ok and return
    else
      render json: report.errors.full_messages, status: :unprocessable_entity and return
    end
  end

  private

  def set_record
    @record = Record.find_by(id: params[:id])
    render json: '', status: :not_found unless @record
  end

  def record_params
    if request.patch?
      params.require(:record).permit(
        :state
      )
    else
      params.require(:record).permit(
        :title,
        :description,
        :state,
        :lat,
        :lng,
        :date_from, :date_to,
        :credit,
        collection_ids: [],
        location: %i[
          address
        ]
      )
    end
  end

  def record_report_params
    params.require(:report).permit(:issue, :message, :email)
  end

  def check_transition(state)
    case state
    when 'published'
      @record.mark_as_published
    when 'pending_review'
      @record.mark_as_pending_review
    when 'flagged'
      @record.mark_as_flagged
    when 'draft'
      @record.mark_as_draft
    when 'delete'
    @record.mark_as_deleted
    end
  end

  def save_record_and_return_from_es(record)
    Chewy.strategy(:urgent) do
      if record.save
        # Get the record from ES; it should be pretty quick but we have to check it's there
        filter = RecordsIndex.filter(ids: {values: [record.id]})
        loop do
          break if filter.count > 0
          sleep 0.1
        end
        return filter.first
      else
        nil
      end
    end
  end
end
