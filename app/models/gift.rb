class Gift < ApplicationRecord
  belongs_to :event
  has_many :gift_payments, dependent: :destroy

  validates :name,  presence: true
  validates :price, presence: true,
                    numericality: { greater_than: 0 }
end
