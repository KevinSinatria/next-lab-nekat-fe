"use client";

import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/store/useAuthStore";
import Image from "next/image";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

const loginSchema = z.object({
  username: z.string().min(1, "Username harus diisi."),
  password: z.string().min(1, "Password harus diisi."),
});

type LoginValues = z.infer<typeof loginSchema>;

function BrandingSection({ insideCard = false }: { insideCard?: boolean }) {
  return (
    <div
      className={`flex flex-col items-center text-center ${
        insideCard
          ? "bg-[#0f2540] text-white rounded-t-xl p-6"
          : "bg-[#0f2540] text-white h-full justify-center px-6"
      }`}
    >
      <Image
        src="/img/smkn1katapang.webp"
        alt="Logo"
        width={120}
        height={120}
        className="mb-4"
      />
      <h1 className="text-2xl font-bold">SMKN 1 KATAPANG</h1>
      <p className="text-sm opacity-80 mb-8">SMK bisa, SMK hebat</p>

      <div className="bg-white/20 px-6 py-2 rounded-lg font-bold tracking-wider">
        SISTEM AKSES LAB
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { login, checkAuth } = useAuthStore();
  const [isOpenPassword, setIsOpenPassword] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const handleLogin = async (values: LoginValues) => {
    const result = await login(values);

    if (result) {
      router.push("/dashboard");
      toast.success("Selamat datang kembali!");
    }
  };

  useEffect(() => {
    const check = async () => {
      const isValid = await checkAuth();

      if (isValid) {
        router.push("/dashboard");
        toast.success("Selamat datang kembali!");
      }
    };

    check();
  }, []);

  return (
    <div className="min-h-screen w-full h-screen flex flex-col md:flex-row">
      {/* LEFT SIDE (Hidden on Mobile) */}
      <div className="hidden md:flex w-1/2 items-center justify-center bg-[#0f2540]">
        <BrandingSection />
      </div>

      {/* RIGHT SIDE (FORM) */}
      <div className="flex w-full md:w-1/2 items-center justify-center h-full bg-slate-50 px-4 py-8">
        <Card className="w-full max-w-md py-0 md:py-8 shadow-md">
          <div className="md:hidden">
            <BrandingSection insideCard />
          </div>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-left">Login</CardTitle>
            <CardDescription className="text-left">
              Masuk ke akun anda untuk mengakses sistem.
            </CardDescription>
          </CardHeader>

          <CardContent className="pb-8 md:pb-0">
            <Form {...form}>
              <form onSubmit={handleSubmit(handleLogin)} className="space-y-4">
                {/* USERNAME */}
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan username..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* PASSWORD */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={isOpenPassword ? "text" : "password"}
                            placeholder="Masukkan password..."
                            {...field}
                          />

                          <button
                            type="button"
                            onClick={() => setIsOpenPassword(!isOpenPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                          >
                            {isOpenPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* BUTTON */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <Spinner />
                      <span>Loading...</span>
                    </div>
                  ) : (
                    "LOGIN"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
