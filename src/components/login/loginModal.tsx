import { useState } from "react";
import styles from "./LoginModal.module.css";

interface Props {
  onClose: () => void;
  onSwitchToSignup: () => void;
}

const LoginModal = ({ onClose, onSwitchToSignup }: Props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
    console.log("Login attempted with:", { email, password });
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
        <div className={styles.circle1}></div>
        <div className={styles.circle2}></div>
        <div className={styles.glowOrb}></div>
        
        <button onClick={onClose} className={styles.closeBtn}>
          ✕
        </button>
        
        <h2>Welcome Back</h2>
        <p className={styles.subtitle}>Sign in to continue</p>

        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.forgotPassword}>
            <a href="#">forgot password?</a>
          </div>

          <button type="submit" className={styles.loginBtn}>
            Sign In
          </button>
        </form>
        
        <div className={styles.signupLink}>
          Don't have an account? <a onClick={onSwitchToSignup}>Sign Up</a>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;