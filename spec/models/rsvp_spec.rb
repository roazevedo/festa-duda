require 'rails_helper'

RSpec.describe Rsvp, type: :model do
  describe 'validações' do
    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_inclusion_of(:attending)
                          .in_array(%w[yes no maybe]) }
    it { is_expected.to validate_numericality_of(:guests)
                          .is_greater_than_or_equal_to(0) }
    it { is_expected.to belong_to(:event) }
  end

  describe 'attending' do
    it 'aceita yes' do
      expect(build(:rsvp, attending: 'yes')).to be_valid
    end

    it 'aceita no' do
      expect(build(:rsvp, attending: 'no')).to be_valid
    end

    it 'aceita maybe' do
      expect(build(:rsvp, attending: 'maybe')).to be_valid
    end

    it 'rejeita valor desconhecido' do
      expect(build(:rsvp, attending: 'quem_sabe')).not_to be_valid
    end
  end

  describe 'guests' do
    it 'aceita zero' do
      expect(build(:rsvp, guests: 0)).to be_valid
    end

    it 'rejeita valor negativo' do
      rsvp = build(:rsvp, guests: -1)
      expect(rsvp).not_to be_valid
      expect(rsvp.errors[:guests]).to be_present
    end
  end

  describe 'restriction' do
    it 'pode ser nulo' do
      expect(build(:rsvp, restriction: nil)).to be_valid
    end

    it 'pode ser string vazia' do
      expect(build(:rsvp, restriction: '')).to be_valid
    end
  end
end
