FactoryBot.define do
  factory :user do
    email    { Faker::Internet.unique.email }
    password { 'Senha@123456' }
    admin    { false }

    trait :admin do
      admin { true }
    end
  end
end
