require 'rails_helper'

# ── Planos da plataforma ─────────────────────────────────────
RSpec.describe Event, type: :model do
  describe 'plano' do
    it 'nasce no plano grátis' do
      expect(create(:event).plan).to eq('gratis')
    end

    it 'rejeita plano desconhecido' do
      event = build(:event, plan: 'premium')
      expect(event).not_to be_valid
    end

    it 'aceita os três planos' do
      Event::PLANS.each do |plan|
        expect(build(:event, plan: plan)).to be_valid
      end
    end
  end

  describe '#plan_limits' do
    it 'limita presentes e fotos no grátis' do
      event = build(:event, plan: 'gratis')
      expect(event.plan_limits[:gifts]).to eq(10)
      expect(event.plan_limits[:photos]).to eq(20)
    end

    it 'não limita presentes e fotos nos planos pagos' do
      %w[completo atelie].each do |plan|
        event = build(:event, plan: plan)
        expect(event.plan_limits[:gifts]).to be_nil
        expect(event.plan_limits[:photos]).to be_nil
      end
    end
  end

  describe '#finished? por plano' do
    it 'grátis: encerra 3 meses após a festa' do
      event = build(:event, plan: 'gratis', event_date: 4.months.ago)
      expect(event).to be_finished
    end

    it 'completo: continua no ar entre 3 e 12 meses após a festa' do
      event = build(:event, plan: 'completo', event_date: 4.months.ago)
      expect(event).not_to be_finished
    end

    it 'completo: encerra 12 meses após a festa' do
      event = build(:event, plan: 'completo', event_date: 13.months.ago)
      expect(event).to be_finished
    end
  end

  describe 'settings restritos por plano' do
    it 'grátis: rejeita tema fora da lista liberada' do
      event = build(:event, plan: 'gratis', settings: { 'theme' => 'bodas-de-ouro' })
      expect(event).not_to be_valid
      expect(event.errors[:base].join).to include('tema')
    end

    it 'grátis: aceita os temas liberados' do
      Event::FREE_THEMES.each do |theme|
        event = build(:event, plan: 'gratis', settings: { 'theme' => theme })
        expect(event).to be_valid
      end
    end

    it 'grátis: rejeita a seção Save the Date ligada' do
      event = build(:event, plan: 'gratis', settings: {
        'sections' => { 'save_the_date' => { 'enabled' => true } }
      })
      expect(event).not_to be_valid
      expect(event.errors[:base].join).to include('Save the Date')
    end

    it 'completo: aceita qualquer tema e o Save the Date' do
      event = build(:event, plan: 'completo', settings: {
        'theme'    => 'bodas-de-ouro',
        'sections' => { 'save_the_date' => { 'enabled' => true } }
      })
      expect(event).to be_valid
    end
  end
end
