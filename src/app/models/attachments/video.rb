class Attachments::Video < ApplicationRecord
  include Attachments::SharedValidations

  # If we save a url in the youtube_id field, make sure only the ID is saved by parsing it first.
  before_save do
    if youtube_id.match(/^http/)
      youtube_id = YoutubeID.from(youtube_id)
    end
  end

  # Utility method used when we index
  def data
    poster = "https://img.youtube.com/vi/#{youtube_id}/0.jpg"
    {
      content_type: "url/video",
      youtube_id: youtube_id,
      image: {
        card: poster,
        large: poster,
        thumb: poster
      },
      thumb: poster,
      poster: poster
    }
  end
end
