require 'rails_helper'

RSpec.describe GiftPayment, type: :model do
  describe 'validações' do
    it { is_expected.to validate_presence_of(:amount) }
    it { is_expected.to validate_numericality_of(:amount).is_greater_than(0) }
    it { is_expected.to belong_to(:gift) }

    it 'rejeita status desconhecido' do
      payment = build(:gift_payment, status: 'weird')
      expect(payment).not_to be_valid
    end

    it 'aceita todos os status do Mercado Pago' do
      GiftPayment::STATUSES.each do |status|
        expect(build(:gift_payment, status: status)).to be_valid
      end
    end
  end

  it 'é removido junto com o presente' do
    payment = create(:gift_payment)
    expect { payment.gift.destroy }.to change(GiftPayment, :count).by(-1)
  end

  describe '.approved' do
    it 'retorna apenas pagamentos aprovados' do
      create(:gift_payment)
      approved = create(:gift_payment, :approved)
      expect(GiftPayment.approved).to eq([ approved ])
    end
  end
end
