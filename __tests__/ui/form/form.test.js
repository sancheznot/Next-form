import { render, screen, setPathname, React, fireEvent, waitFor, act } from '@test-utils';
import { signIn } from "next-auth/react";
import axios from "axios";
import Form from "@/components/auth/Form";  

// Mock modules
jest.mock("next-auth/react", () => ({
  signIn: jest.fn()
}));

jest.mock("axios");

describe("Form Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("UI Rendering", () => {
    it('renders login form correctly', () => {
      setPathname('/login');
      render(<Form />);
      
      expect(screen.getByTestId("form-title")).toHaveTextContent("Sign In");
      expect(screen.getByTestId("submit-button")).toHaveTextContent("Sign In");
    });

    it('renders registration form correctly', () => {
      setPathname('/register');
      render(<Form />);
      
      expect(screen.getByTestId("form-title")).toHaveTextContent("Sign Up");
      expect(screen.getByTestId("submit-button")).toHaveTextContent("Sign Up");
    });
  });

  describe("Form Validation", () => {
    it('shows error when submitting login form without data', async () => {
      setPathname('/login');
      render(<Form />);
      
      fireEvent.click(screen.getByTestId("submit-button"));
      
      await waitFor(() => {
        expect(screen.getByText(/email and password are required/i)).toBeInTheDocument();
      });
    });

    it('shows error when submitting registration with invalid email', async () => {
      setPathname('/register');
      render(<Form />);
      
      const emailInput = screen.getByLabelText(/email/i);
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.click(screen.getByTestId("submit-button"));
      
      await waitFor(() => {
        expect(axios.post).not.toHaveBeenCalled();
      });
    });
  });

  describe("Form Submission", () => {
    it('handles successful login', async () => {
      setPathname('/login');
      signIn.mockResolvedValueOnce({ ok: true });
      render(<Form />);

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'password123' }
      });
      fireEvent.click(screen.getByTestId("submit-button"));

      await waitFor(() => {
        expect(signIn).toHaveBeenCalledWith("credentials", {
          email: 'test@example.com',
          password: 'password123',
          redirect: false
        });
      });
    });

    it('handles successful registration', async () => {
      setPathname('/register');
      axios.post.mockImplementation(() => 
        Promise.resolve({ data: { message: "User created successfully" } })
      );
      signIn.mockResolvedValueOnce({ ok: true });
      
      render(<Form />);

      // Rellenar el formulario
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByTestId('name-input'), {
        target: { value: 'John' },
      });
      fireEvent.change(screen.getByTestId('lastname-input'), {
        target: { value: 'Doe' },
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'password123' },
      });
      
      // Submit form
      await act(async () => {
        fireEvent.click(screen.getByTestId("submit-button"));
      });

      // Verificar llamadas y mensajes
      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith("/api/auth/signup", {
          email: 'test@example.com',
          name: 'John',
          lastname: 'Doe',
          password: 'password123',
        });
      });

      await waitFor(() => {
        expect(screen.getByTestId('success-message')).toHaveTextContent(/user created successfully/i);
      });
    });
  });

  describe("Error Handling", () => {
    it('displays login error message', async () => {
      setPathname('/login');
      signIn.mockResolvedValueOnce({ error: "Invalid credentials" });
      
      render(<Form />);
      fireEvent.click(screen.getByTestId("submit-button"));

      await waitFor(() => {
        expect(screen.getByText(/email and password are required/i)).toBeInTheDocument();
      });
    });

    it('displays registration error message', async () => {
      setPathname('/register');
      axios.post.mockRejectedValueOnce({
        response: { data: { message: "Email already exists" } }
      });
      
      render(<Form />);
      
      // Agregar valores a los campos requeridos
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByTestId('name-input'), {
        target: { value: 'John' },
      });
      fireEvent.change(screen.getByTestId('lastname-input'), {
        target: { value: 'Doe' },
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'password123' },
      });
      
      fireEvent.click(screen.getByTestId("submit-button"));

      await waitFor(() => {
        const errorMessage = screen.getByTestId('error-message');
        expect(errorMessage).toHaveTextContent(/email already exists/i);
      });
    });
  });

  describe("Loading States", () => {
    it('disables form during login submission', async () => {
      setPathname('/login');
      signIn.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ ok: true }), 500)));
      
      render(<Form />);
      
      // Simular envío del formulario
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'password123' },
      });

      const submitButton = screen.getByTestId("submit-button");
      fireEvent.click(submitButton);
      
      // Verificar que el botón está deshabilitado inmediatamente después del clic
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveTextContent(/processing/i);
    });

    it('shows loading state during registration', async () => {
      setPathname('/register');
      axios.post.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ data: { message: "success" } }), 500)));
      
      render(<Form />);
      
      const submitButton = screen.getByTestId("submit-button");
      fireEvent.click(submitButton);
      
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveTextContent(/processing/i);
    });
  });
});
