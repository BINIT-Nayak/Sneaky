import type { FC } from "react";
import { useState } from "react";

import { FaTimes } from "react-icons/fa";

import { Button } from "../../components/Button/Button";
import { ButtonVariant } from "../../components/Button/type";

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

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoginMode) {
      await onLogin(email, password);
    } else {
      await onSignUp(name, email, password);
    }
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

          {error ? (
            <p className={styles.authModal__error} role="alert">
              {error}
            </p>
          ) : null}
        </form>

        <div className={styles.authModal__toggle}>
          <p>
            {isLoginMode
              ? "Don't have an account?"
              : "Already have an account?"}
            <button type="button" onClick={() => setIsLoginMode(!isLoginMode)}>
              {isLoginMode ? "Sign Up" : "Log In"}
            </button>
          </p>
        </div>

        <div className={styles.authModal__powered}>Powered by Sneaky</div>
      </div>
    </div>
  );
};
