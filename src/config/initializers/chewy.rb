Chewy.strategy(:atomic)
Chewy.logger = Logger.new(STDOUT)
Chewy.settings = {
  prefix: Rails.env,
  host: Rails.env.development? ? "127.0.0.1:9200" : "db01.lol:9200"
}