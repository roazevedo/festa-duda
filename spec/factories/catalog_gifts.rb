FactoryBot.define do
  factory :catalog_gift do
    sequence(:key) { |n| "presente-#{n}" }
    event_type  { "casamento" }
    name        { Faker::Commerce.product_name }
    description { Faker::Lorem.sentence(word_count: 5) }
    price       { Faker::Commerce.price(range: 50.0..600.0) }
    category    { "lua_de_mel" }
    sequence(:position) { |n| n }
  end
end
