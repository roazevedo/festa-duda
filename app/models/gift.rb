class Gift < ApplicationRecord
  belongs_to :event
  has_many :gift_payments, dependent: :destroy

  validates :name,  presence: true, length: { maximum: 255 }
  # Teto abaixo do limite da coluna decimal(10,2) (99.999.999,99):
  # sem ele, um preço gigante estoura PG::NumericValueOutOfRange (500)
  # em vez de um 422 tratado.
  validates :price, presence: true,
                    numericality: { greater_than: 0, less_than: 100_000_000 }
end
