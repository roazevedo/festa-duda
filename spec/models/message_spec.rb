require 'rails_helper'

RSpec.describe Message, type: :model do
  describe 'validações' do
    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_presence_of(:body) }
    it { is_expected.to belong_to(:event) }
  end

  it 'é válido com atributos corretos' do
    expect(build(:message)).to be_valid
  end
end
