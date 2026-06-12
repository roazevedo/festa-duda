require 'rails_helper'

RSpec.describe Photo, type: :model do
  describe 'validações' do
    it { is_expected.to validate_presence_of(:url) }
    it { is_expected.to validate_presence_of(:cloudinary_id) }
    it { is_expected.to belong_to(:event) }
  end

  describe 'category' do
    it 'tem galeria como categoria padrão' do
      photo = create(:photo)
      expect(photo.category).to eq('galeria')
    end

    it 'aceita categoria traje' do
      photo = create(:photo, :traje)
      expect(photo.category).to eq('traje')
    end
  end
end
