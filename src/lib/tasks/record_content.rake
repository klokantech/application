namespace :record_content do
  namespace :records do
    desc "Fix plain text record content"
    task cleanup: :environment do
      records = Record.all
      plain_text_records = records.select{|r| r.description !~ /^\<p\>/}

      puts "Cleaning up #{plain_text_records.size} record description"

      plain_text_records.each do |record|
        puts record.title
        description = ActionController::Base.helpers.simple_format(ActionController::Base.helpers.strip_tags(record.description))
        record.update_attribute(:description, description)
      end
    end
  end

  namespace :text_attachments do
    desc "Add Attachments::Text data onto record descriptions"
    task cleanup: :environment do
      text_attachments = Attachments::Text.includes(attachment: :record).all
      puts "Cleaning up #{text_attachments.size} attachments"

      text_attachments.each do |text_attachment|
        record = Record.unscoped.find(text_attachment.attachment.record_id)
        next if record.deleted?
        puts record.title
        description = text_attachment.attachment.record.description
        content = ActionController::Base.helpers.simple_format(ActionController::Base.helpers.strip_tags(text_attachment.content))

        record_description = "#{description}#{content}"
        text_attachment.attachment.record.update_attribute(:description, record_description)
        text_attachment.attachment.destroy
      end

    end
  end

  namespace :duplicate_collections do
    desc "Remove duplicate collection associations"
    task cleanup: :environment do
      records = Record.includes(:collections).all
      records.each do |record|
        next unless record.collection_ids.group_by{|cid| cid}.values.any?{|ids| ids.length>1}

        puts "Record has duplicate collections: #{record.title} #{record.collection_ids}"
        record.collection_records.group_by{|cr| cr.collection_id}.each do |key, collection_records|
          keep = collection_records.shift
          collection_records.map(&:destroy)
        end
      end
    end
  end
end
