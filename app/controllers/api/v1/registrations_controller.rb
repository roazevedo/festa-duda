class Api::V1::RegistrationsController < ApplicationController
  # Cadastro manual. Diferente do fluxo antigo, NÃO emite JWT aqui: o e-mail
  # precisa ser confirmado por um código antes de a conta poder ser usada.
  def create
    email = sign_up_params[:email].to_s.strip.downcase
    existing = User.find_by(email: email)

    # Reaproveita um cadastro anterior que nunca foi confirmado: atualiza a
    # senha e reenvia o código, evitando que um e-mail não-verificado fique
    # "preso" e bloqueie novas tentativas do próprio dono.
    if existing&.email_verified? == false
      if existing.update(sign_up_params.merge(admin: false))
        send_verification(existing)
        return render_pending(existing)
      else
        return render json: { errors: existing.errors.full_messages }, status: :unprocessable_entity
      end
    end

    user = User.new(sign_up_params)
    user.admin = false # nunca permite que o cadastro público se torne admin

    if user.save
      send_verification(user)
      render_pending(user)
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def sign_up_params
    params.require(:user).permit(:email, :password, :password_confirmation)
  end

  def send_verification(user)
    code = user.generate_verification_code!
    UserMailer.verification_code(user, code).deliver_now
  end

  def render_pending(user)
    render json: {
      message: "Enviamos um código de verificação para #{user.email}.",
      email:   user.email,
      verification_required: true
    }, status: :created
  end
end
