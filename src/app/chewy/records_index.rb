class RecordsIndex < Chewy::Index
  def self.policy_class
    "Record"
  end
  
  define_type Record.includes(:user, :collections, :attachments) do

    field :id, type: 'integer'
    field :title, type: 'text', analyzer: :english
    field :description, type: 'text', analyzer: :english
    field :like_count, type: 'integer'
    field :view_count, type: 'integer'
    field :state, type: 'keyword'
    field :pin, type: 'geo_point', value: ->{ {lat: lat, lon: lng} }
    field :date_from, type: 'date'
    field :date_to, type: 'date'
    field :created_at, type: 'date'
    field :updated_at, type: 'date'
    field :location, type: 'object'
    field :credit, type: 'text'
    field :user, type: 'object' do
      field :id, type: 'integer'
      field :name, type: 'text'
    end
    field :collections, type: 'object' do
      field :read_state, type: 'keyword'
    end
    field :attachments, type: 'object' do
      field :id, type: 'integer'
      field :title, type: 'text', analyzer: :english
      field :caption, type: 'text', analyzer: :english
      field :credit, type: 'text', analyzer: :english
      field :attachable_type, type: 'keyword'
      field :attachable, type: 'object', value: -> {attachable.data}
    end

    field :image, type: 'object', value: -> {
      primary_image.try(:data)
    }
    field :taxonomy_terms, type: 'object' do
      field :id, type: 'integer'
      field :name, type: 'keyword'
      field :taxonomy, type: 'object' do
        field :id, type: 'integer'
        field :name, type: 'keyword'
        field :description, type: 'text', analyzer: :english
      end
    end

    field :view_type, type: 'keyword'

  end

  def self.published
    filter(terms: {state: ['published']})
  end
end