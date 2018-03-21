class Attachments::Image < ApplicationRecord
  include SharedValidations
  has_one :attachment, as: :attachable
end
