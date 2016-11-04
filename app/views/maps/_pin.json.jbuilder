json.id pin.id
json.title pin.title
json.pinned_on_date pin.created_at.strftime("#{pin.created_at.day.ordinalize} %b %Y")
json.location "Dagenham"
json.position do
  json.lat pin.lat
  json.lng pin.lng
end
json.content_entry do
  json.partial! 'maps/content_entry', locals: {content_entry: pin.content_entry}
end
