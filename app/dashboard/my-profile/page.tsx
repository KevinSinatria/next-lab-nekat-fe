/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { AxiosError } from "axios";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

export default function ProfilePage() {
  const { user, checkAuth, logout } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isShowPassword, setIsShowPassword] = useState<string[]>([]);
  const [isOpenDialog, setIsOpenDialog] = useState<string[]>([]);
  const router = useRouter();

  const [profileData, setProfileData] = useState({
    username: user?.username || "",
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  //   const handleProfileUpdate = async (e: React.FormEvent) => {
  //     e.preventDefault();
  //     setLoading(true);
  //     setMessage(null);

  //     try {
  //       await api.put("/users/profile", profileData);
  //       await checkAuth();
  //       toast.success("Profil berhasil diperbarui!");
  //       //   setMessage({ type: "success", text: "Profil berhasil diperbarui!" });
  //     } catch (error: any) {
  //       if (error instanceof AxiosError) {
  //         toast.error(error.response?.data.message || "Gagal mengubah profil");
  //       }
  //       //   setMessage({
  //       //     type: "error",
  //       //     text: error.message || "Gagal memperbarui profil",
  //       //   });
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Password tidak cocok");
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password minimal 6 karakter");
      setLoading(false);
      return;
    }

    try {
      await api.post("/Auth/change-password", passwordData);
      await checkAuth();

      setPasswordData({
        newPassword: "",
        confirmPassword: "",
        oldPassword: "",
      });
    } catch (error: any) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message || "Gagal mengubah password");
      }
      //   setMessage({
      //     type: "error",
      //     text: error.message || "Gagal mengubah password",
      //   });
    } finally {
      setLoading(false);
    }
  };

  const initials =
    user?.username
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() ||
    user?.username?.[0].toUpperCase() ||
    "U";

  return (
    <div className="space-y-6 max-w-4xl bg-gray-50 dark:bg-neutral-900 text-gray-900 dark:text-gray-100">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-neutral-100">
          Profil Saya
        </h1>
        <p className="text-gray-600 dark:text-neutral-300 mt-2">
          Kelola informasi akun Anda
        </p>
      </div>

      {message && (
        <Alert
          variant={message.type === "error" ? "destructive" : "default"}
          className={
            message.type === "success"
              ? "bg-green-50 text-green-900 border-green-200"
              : ""
          }
        >
          {message.type === "success" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Card className="bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-neutral-100">
            Informasi Akun
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-neutral-300">
            Detail akun saat ini
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src="" alt={user?.username || "User"} />
              <AvatarFallback className="bg-blue-600 text-white text-xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm text-gray-600 dark:text-neutral-300">
                {user?.username}
              </p>
              <p className="text-xs text-gray-500 dark:text-neutral-400 capitalize mt-1">
                Role: {user?.role}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Edit Profil</TabsTrigger>
          <TabsTrigger value="password">Ubah Password</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-neutral-100">
                Edit Profil
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-neutral-300">
                Perbarui informasi profil Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={profileData.username}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        username: e.target.value,
                      })
                    }
                    disabled
                  />
                </div>

                <AlertDialog>
                  <AlertDialogTrigger>
                    <Button
                      type="button"
                      disabled
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        "Simpan Perubahan"
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Apakah anda yakin untuk mengubah informasi akun?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Dengan melakukan perubahan, anda akan otomatis logout
                        dan harus login kembali dengan data akun terbaru.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction disabled>
                        Simpan
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </form>
            </CardContent>
            <CardFooter>
              <small>
                *Edit informasi akun akan mengharuskan Anda untuk login kembali.
              </small>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card className="bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-neutral-100">
                Ubah Password
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-neutral-300">
                Perbarui password akun Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2 relative">
                  <Label htmlFor="oldPassword">Password Lama</Label>
                  <Input
                    id="oldPassword"
                    type={
                      isShowPassword.includes("oldPassword")
                        ? "text"
                        : "password"
                    }
                    value={passwordData.oldPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        oldPassword: e.target.value,
                      })
                    }
                    placeholder="Password Lama..."
                    disabled={loading}
                    minLength={6}
                  />
                  {!isShowPassword.includes("oldPassword") ? (
                    <Eye
                      className="h-6 w-6 cursor-pointer absolute right-3 top-7"
                      onClick={() =>
                        setIsShowPassword([...isShowPassword, "oldPassword"])
                      }
                    />
                  ) : (
                    <EyeOff
                      className="h-6 w-6 cursor-pointer absolute right-3 top-7"
                      onClick={() =>
                        setIsShowPassword(
                          isShowPassword.filter(
                            (item) => item !== "oldPassword"
                          )
                        )
                      }
                    />
                  )}
                </div>

                <div className="space-y-2 relative">
                  <Label htmlFor="newPassword">Password Baru</Label>
                  <Input
                    id="newPassword"
                    type={
                      isShowPassword.includes("newPassword")
                        ? "text"
                        : "password"
                    }
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    placeholder="Password Baru..."
                    disabled={loading}
                    minLength={6}
                  />
                  {!isShowPassword.includes("newPassword") ? (
                    <Eye
                      className="h-6 w-6 cursor-pointer absolute right-3 top-7"
                      onClick={() =>
                        setIsShowPassword([...isShowPassword, "newPassword"])
                      }
                    />
                  ) : (
                    <EyeOff
                      className="h-6 w-6 cursor-pointer absolute right-3 top-7"
                      onClick={() =>
                        setIsShowPassword(
                          isShowPassword.filter(
                            (item) => item !== "newPassword"
                          )
                        )
                      }
                    />
                  )}
                </div>

                <div className="space-y-2 relative">
                  <Label htmlFor="confirmPassword">
                    Konfirmasi Password Baru
                  </Label>
                  <Input
                    id="confirmPassword"
                    type={
                      isShowPassword.includes("confirmPassword")
                        ? "text"
                        : "password"
                    }
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    placeholder="Konfirmasi Password Baru..."
                    disabled={loading}
                    minLength={6}
                  />
                  {!isShowPassword.includes("confirmPassword") ? (
                    <Eye
                      className="h-6 w-6 cursor-pointer absolute right-3 top-7"
                      onClick={() =>
                        setIsShowPassword([
                          ...isShowPassword,
                          "confirmPassword",
                        ])
                      }
                    />
                  ) : (
                    <EyeOff
                      className="h-6 w-6 cursor-pointer absolute right-3 top-7"
                      onClick={() =>
                        setIsShowPassword(
                          isShowPassword.filter(
                            (item) => item !== "confirmPassword"
                          )
                        )
                      }
                    />
                  )}
                </div>

                <AlertDialog
                  open={isOpenDialog.includes("password")}
                  onOpenChange={(isOpen) =>
                    setIsOpenDialog(
                      isOpen
                        ? [...isOpenDialog, "password"]
                        : isOpenDialog.filter((item) => item !== "password")
                    )
                  }
                >
                  <AlertDialogTrigger>
                    <Button
                      type="button"
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        "Simpan Perubahan"
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Apakah anda yakin untuk mengubah password?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Dengan melakukan perubahan, anda akan otomatis logout
                        dan harus login kembali dengan password terbaru.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={(e) => {
                          setIsOpenDialog(
                            isOpenDialog.filter((item) => item !== "password")
                          );
                          handlePasswordUpdate(e);
                        }}
                      >
                        Simpan
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
