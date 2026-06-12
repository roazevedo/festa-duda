FactoryBot.define do
  factory :event do
    association :user
    name             { Faker::Name.first_name }
    slug             { Faker::Internet.unique.slug(glue: "-") }
    event_type       { "quinze_anos" }
    event_date       { 3.months.from_now }
    venue_name       { "Salão Elite" }
    venue_address    { "Rua das Flores, 100, Rio de Janeiro" }
    rsvp_list_public { true }
    messages_public  { true }
  end
end
