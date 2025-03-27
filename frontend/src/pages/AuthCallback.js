import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { authRequest, authSuccess, authFail } from "../store/authSlice";

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

            navigate("/dashboard");
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center">
      <div className="animate-pulse text-indigo-600 dark:text-indigo-400 text-xl font-medium">
        处理您的登录...
      </div>
    </div>
  );
};

export default AuthCallback;
