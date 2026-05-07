import type { FC } from "react";
import { useState } from "react";

import { FaTimes } from "react-icons/fa";

import { Button } from "../../components/Button/Button";
import { ButtonVariant } from "../../components/Button/type";
import { Toast } from "../../components/Toast/Toast";
import {
  isStrongPassword,
  PASSWORD_REQUIREMENT_MESSAGE,
} from "../../utils/passwordValidation";

import styles from "./AuthModal.module.css";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<void>;
  onSignUp: (name: string, email: string, password: string) => Promise<void>;
  error: string | null;
  isSubmitting: boolean;
}

export const AuthModal: FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  onSignUp,
  error,
  isSubmitting,
}) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (isLoginMode) {
      await onLogin(email, password);
    } else {
      if (!isStrongPassword(password)) {
        setLocalError(PASSWORD_REQUIREMENT_MESSAGE);
        return;
      }

      await onSignUp(name, email, password);
    }
  };

  const handleToggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setLocalError(null);
  };

  //TODO: Think later should we add all login/signup logic here instead of passing it as props
  return (
    <div className={styles.authModal__overlay} onClick={onClose}>
      <div className={styles.authModal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.authModal__close} onClick={onClose}>
          <FaTimes />
        </button>

        <div className={styles.authModal__header}>
          <h2 className={styles.authModal__title}>Sneaky</h2>
          <p className={styles.authModal__subtitle}>
            {isLoginMode ? "Welcome Back!" : "Join the Fun!"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.authModal__form}>
          {isLoginMode === false ? (
            <div className={styles.authModal__field}>
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>
          ) : null}

          <div className={styles.authModal__field}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className={styles.authModal__field}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
            {isLoginMode === false ? (
              <p className={styles.authModal__hint}>
                At least 8 characters with letters, numbers, and a special
                character.
              </p>
            ) : null}
          </div>

          {/* TODO: Add forgot password link and functionality after backend integration*/}
          {/* {isLoginMode ? (
            <div className={styles.authModal__forgot}>
              <a href="#">Forgot password?</a>
            </div>
          ) : null} */}

          <Button
            type="submit"
            variant={ButtonVariant.DEFAULT}
            glow
            className={styles.authModal__submit}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Please wait..."
              : isLoginMode
                ? "Log In"
                : "Sign Up"}
          </Button>

          <Toast message={localError ?? error} role="alert" />
        </form>

        <div className={styles.authModal__toggle}>
          <p>
            {isLoginMode
              ? "Don't have an account?"
              : "Already have an account?"}
            <button type="button" onClick={handleToggleMode}>
              {isLoginMode ? "Sign Up" : "Log In"}
            </button>
          </p>
        </div>

        <div className={styles.authModal__powered}>Powered by Sneaky</div>
      </div>
    </div>
  );
};
