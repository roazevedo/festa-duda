FactoryBot.define do
  factory :photo do
    association :event
    url           { "https://res.cloudinary.com/demo/image/upload/#{SecureRandom.hex(8)}.jpg" }
    thumb_url     { "https://res.cloudinary.com/demo/image/upload/thumb_#{SecureRandom.hex(8)}.jpg" }
    cloudinary_id { "festa-duda/#{Faker::Alphanumeric.alpha(number: 10)}" }
    caption       { "" }
    category      { "galeria" }

    trait :traje do
      category { "traje" }
      caption  { "vestido_longo" }
    end
  end
end
