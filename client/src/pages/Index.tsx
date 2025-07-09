import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "../lib/supabase";

type AuthFormData = {
  email: string;
  password: string;
  confirmPassword?: string;
  username?: string;
};

const IndexPage = () => {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AuthFormData>();

  const onSubmit = async (data: AuthFormData) => {
    setError(null);

    if (mode === "signup") {
      if (data.password !== data.confirmPassword) {
        setError("Les mots de passe ne correspondent pas.");
        return;
      }

      const { error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            username: data.username,
          },
        },
      });

      if (signUpError) setError(signUpError.message);
    }

    if (mode === "signin") {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (signInError) setError(signInError.message);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow">
        <h1 className="text-2xl font-bold text-center mb-6">MyFitHero</h1>
        <div className="flex justify-center mb-4">
          <button
            onClick={() => setMode("signin")}
            className={`px-4 py-2 ${mode === "signin" ? "border-b-2 border-blue-500 font-medium" : "text-gray-500"}`}
          >
            Connexion
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`px-4 py-2 ${mode === "signup" ? "border-b-2 border-blue-500 font-medium" : "text-gray-500"}`}
          >
            Inscription
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            {...register("email", { required: true })}
            className="w-full border p-2 rounded"
          />
          {mode === "signup" && (
            <input
              type="text"
              placeholder="Nom d'utilisateur"
              {...register("username", { required: true })}
              className="w-full border p-2 rounded"
            />
          )}
          <input
            type="password"
            placeholder="Mot de passe"
            {...register("password", { required: true })}
            className="w-full border p-2 rounded"
          />
          {mode === "signup" && (
            <input
              type="password"
              placeholder="Confirmer le mot de passe"
              {...register("confirmPassword", { required: true })}
              className="w-full border p-2 rounded"
            />
          )}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            {mode === "signup" ? "Créer un compte" : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default IndexPage;
