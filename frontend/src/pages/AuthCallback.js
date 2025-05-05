import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { authRequest, authSuccess, authFail } from "../store/authSlice";
import { FiLoader } from "react-icons/fi";

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    // 从URL参数中获取token
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const error = params.get("error");

    if (token) {
      // 通知Redux开始认证请求
      dispatch(authRequest());

      // 储存token
      localStorage.setItem("token", token);

      // 获取用户信息
      fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            // 存储到本地存储
            localStorage.setItem("user", JSON.stringify(data.data));

            // 更新Redux状态
            dispatch(
              authSuccess({
                user: data.data,
                token: token,
              })
            );

            navigate("/");
          } else {
            dispatch(authFail("认证失败"));
            navigate("/login?error=auth_failed");
          }
        })
        .catch(() => {
          dispatch(authFail("网络错误"));
          navigate("/login?error=network_error");
        });
    } else if (error) {
      dispatch(authFail(error));
      navigate(`/login?error=${error}`);
    } else {
      navigate("/login");
    }
  }, [navigate, location, dispatch]);

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center">
      <FiLoader className="animate-spin text-black text-3xl mb-4" />
      <div className="text-black text-xl font-medium">处理您的登录...</div>
    </div>
  );
};

export default AuthCallback;
