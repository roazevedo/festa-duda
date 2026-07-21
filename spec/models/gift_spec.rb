require 'rails_helper'

RSpec.describe Gift, type: :model do
  describe 'validações' do
    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_presence_of(:price) }
    it { is_expected.to validate_numericality_of(:price).is_greater_than(0) }
    it { is_expected.to belong_to(:event) }
  end

  it 'não aceita preço zero' do
    gift = build(:gift, price: 0)
    expect(gift).not_to be_valid
  end

  it 'rejeita preço acima do limite da coluna (evita overflow/500)' do
    gift = build(:gift, price: 100_000_000)
    expect(gift).not_to be_valid
    expect(gift.errors[:price]).to be_present
  end

  it 'é removido junto com o evento' do
    gift = create(:gift)
    expect { gift.event.destroy }.to change(Gift, :count).by(-1)
  end
end
