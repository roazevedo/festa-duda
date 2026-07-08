class Gift < ApplicationRecord
  belongs_to :event

  validates :name,  presence: true
  validates :price, presence: true,
                    numericality: { greater_than: 0 }
end
