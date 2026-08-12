class Api::V1::EmailVerificationsController < ApplicationController
  # Confirma o cadastro manual a partir do código enviado por e-mail.
  # Em caso de sucesso, autentica o usuário (emite o JWT via devise-jwt) —
  # por isso esta rota está em `jwt.dispatch_requests` no devise.rb.
  def verify
    user = find_user
    return render_invalid unless user

    if user.email_verified?
      return render json: { error: "Este e-mail já foi confirmado. Faça login." }, status: :unprocessable_entity
    end

    if user.verify_code(params[:code])
      warden.set_user(user, scope: :user)
      prime_session_activity!

      render json: {
        message: "E-mail confirmado com sucesso.",
        user:    { id: user.id, email: user.email, admin: user.admin? }
      }, status: :ok
    else
      render json: { error: "Código inválido ou expirado." }, status: :unprocessable_entity
    end
  end

  # Reenvia um novo código para uma conta ainda não confirmada.
  def resend
    user = find_user

    # Resposta neutra: não confirma nem nega a existência da conta.
    if user && !user.email_verified?
      code = user.generate_verification_code!
      UserMailer.verification_code(user, code).deliver_now
    end

    render json: {
      message: "Se houver um cadastro pendente para este e-mail, enviamos um novo código."
    }, status: :ok
  end

  private

  def find_user
    email = params[:email].to_s.strip.downcase
    return nil if email.blank?

    User.find_by(email: email)
  end

  def render_invalid
    render json: { error: "Código inválido ou expirado." }, status: :unprocessable_entity
  end
end
