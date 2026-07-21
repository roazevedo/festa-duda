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

  it 'não salva corpo que fica vazio após remover tags' do
    expect(build(:message, body: '<br>')).not_to be_valid
  end

  it 'remove tags do corpo antes de salvar' do
    msg = create(:message, body: '<b>Parabéns</b>')
    expect(msg.body).to eq('Parabéns')
  end
end
