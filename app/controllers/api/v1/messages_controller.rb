class Api::V1::MessagesController < Api::V1::EventResourcesController
  def index
    unless @event.messages_public? || admin_viewing?
      render json: { error: "Mural privado" }, status: :forbidden and return
    end
    messages = @event.messages.order(created_at: :desc)
    render json: messages.map { |m| message_json(m) }
  end

  def create
    message = @event.messages.build(message_params)
    if message.save
      render json: message_json(message), status: :created
    else
      render json: { errors: message.errors.full_messages },
             status: :unprocessable_entity
    end
  end

  private

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
