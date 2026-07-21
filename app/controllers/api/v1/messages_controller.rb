class Api::V1::MessagesController < Api::V1::EventResourcesController
  before_action :reject_if_finished!, only: [ :create ]

  # Janela para colapsar envios idênticos (double-click / retry)
  DEDUP_WINDOW = 10.seconds

  def index
    unless @event.messages_public? || admin_viewing?
      render json: { error: "Mural privado" }, status: :forbidden and return
    end
    messages = @event.messages.order(created_at: :desc)
    render json: messages.map { |m| message_json(m) }
  end

  def create
    message = @event.messages.build(message_params)

    # Anti double-submit: recado idêntico (mesmo nome+texto) em segundos
    # é quase certo um clique duplo — devolve o já gravado.
    if message.valid? && (recent = recent_duplicate(message))
      return render json: message_json(recent), status: :created
    end

    if message.save
      render json: message_json(message), status: :created
    else
      render json: { errors: message.errors.full_messages },
             status: :unprocessable_entity
    end
  end

  private

  def recent_duplicate(message)
    @event.messages
          .where(name: message.name, body: message.body)
          .where("created_at > ?", DEDUP_WINDOW.ago)
          .order(created_at: :desc)
          .first
  end

  def message_params
    params.require(:message).permit(:name, :body)
  end

  def message_json(message)
    {
      id:         message.id,
      name:       message.name,
      body:       message.body,
      created_at: message.created_at
    }
  end
end
