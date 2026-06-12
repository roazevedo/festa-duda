require 'rails_helper'

RSpec.describe Event, type: :model do
  subject { create(:event) }
  # ── Validações com shoulda-matchers ────────────────────────

  describe 'validações' do
    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_presence_of(:slug) }
    it { is_expected.to validate_presence_of(:event_type) }
    it { is_expected.to validate_presence_of(:event_date) }
    it { is_expected.to validate_uniqueness_of(:slug) }
    it { is_expected.to validate_inclusion_of(:event_type)
                          .in_array(%w[quinze_anos casamento aniversario]) }
    it { is_expected.to belong_to(:user) }
    it { is_expected.to have_many(:rsvps).dependent(:destroy) }
    it { is_expected.to have_many(:messages).dependent(:destroy) }
    it { is_expected.to have_many(:photos).dependent(:destroy) }
  end

  # ── Slug ───────────────────────────────────────────────────

  describe 'formato do slug' do
    it 'aceita letras minúsculas e hífens' do
      event = build(:event, slug: 'maria-eduarda-2026')
      expect(event).to be_valid
    end

    it 'rejeita letras maiúsculas' do
      event = build(:event, slug: 'Maria-Eduarda')
      expect(event).not_to be_valid
    end

    it 'rejeita espaços' do
      event = build(:event, slug: 'maria eduarda')
      expect(event).not_to be_valid
    end

    it 'rejeita caracteres especiais' do
      event = build(:event, slug: 'maria@eduarda!')
      expect(event).not_to be_valid
    end
  end

  # ── Token ──────────────────────────────────────────────────

  describe 'geração de token' do
    it 'gera token automaticamente ao criar' do
      event = create(:event)
      expect(event.token).to be_present
    end

    it 'gera token com comprimento adequado' do
      event = create(:event)
      expect(event.token.length).to be > 10
    end

    it 'gera tokens únicos entre eventos' do
      event1 = create(:event)
      event2 = create(:event)
      expect(event1.token).not_to eq(event2.token)
    end

    it 'não altera o token ao atualizar o evento' do
      event  = create(:event)
      token  = event.token
      event.update!(name: 'Novo Nome')
      expect(event.reload.token).to eq(token)
    end
  end

  # ── full_path ──────────────────────────────────────────────

  describe '#full_path' do
    it 'retorna /slug/token' do
      event = create(:event, slug: 'meu-evento')
      expect(event.full_path).to eq("/meu-evento/#{event.token}")
    end
  end

  # ── Deleção em cascata ─────────────────────────────────────

  describe 'deleção em cascata' do
    it 'deleta rsvps ao deletar evento' do
      event = create(:event)
      create_list(:rsvp, 3, event: event)
      expect { event.destroy }.to change(Rsvp, :count).by(-3)
    end

    it 'deleta mensagens ao deletar evento' do
      event = create(:event)
      create_list(:message, 2, event: event)
      expect { event.destroy }.to change(Message, :count).by(-2)
    end

    it 'deleta fotos ao deletar evento' do
      event = create(:event)
      create_list(:photo, 4, event: event)
      expect { event.destroy }.to change(Photo, :count).by(-4)
    end
  end
end
