import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  TextField,
  Grid,
  LinearProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  WorkOutline,
  Description,
  Assessment,
  Add,
  FileUpload,
  Edit,
} from "@mui/icons-material";

// 用户之前的组件样式
const StyledButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginRight: theme.spacing(2),
}));

const JobCard = styled(Card)(({ theme, selected }) => ({
  marginBottom: theme.spacing(2),
  cursor: "pointer",
  border: selected
    ? `1px solid ${theme.palette.primary.main}`
    : "1px solid transparent",
  backgroundColor: selected ? "rgba(25, 118, 210, 0.08)" : "transparent",
  transition: "all 0.2s",
  "&:hover": {
    boxShadow: theme.shadows[3],
    transform: "translateY(-2px)",
  },
}));

const ResumeCard = styled(Card)(({ theme, selected }) => ({
  marginBottom: theme.spacing(2),
  cursor: "pointer",
  border: selected
    ? `1px solid ${theme.palette.primary.main}`
    : "1px solid transparent",
  backgroundColor: selected ? "rgba(25, 118, 210, 0.08)" : "transparent",
  transition: "all 0.2s",
  "&:hover": {
    boxShadow: theme.shadows[3],
    transform: "translateY(-2px)",
  },
}));

const AnalysisStartPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [previousSteps, setPreviousSteps] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [isCustomJobMode, setIsCustomJobMode] = useState(false);
  const [customJobText, setCustomJobText] = useState("");
  const [parsedJob, setParsedJob] = useState(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStage, setAnalysisStage] = useState("");
  const [isParsingJob, setIsParsingJob] = useState(false);

  // 获取用户的职位和简历
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        // 获取用户保存的职位
        const jobsResponse = await axios.get("/api/jobs/user", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // 获取用户的简历
        const resumesResponse = await axios.get("/api/resumes", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setJobs(jobsResponse.data.data || []);
        setResumes(resumesResponse.data.data || []);

        // 检查是否从简历上传页面返回
        const returnToInterview = localStorage.getItem("returnToInterview");
        if (returnToInterview === "true") {
          const savedJobId = localStorage.getItem("selectedJobId");
          if (savedJobId) {
            setSelectedJobId(savedJobId);
          }
          // 清除存储的状态
          localStorage.removeItem("returnToInterview");
          localStorage.removeItem("selectedJobId");
          // 如果有已选职位，直接跳到第二步
          if (savedJobId) {
            const newPreviousSteps = [...previousSteps, 1];
            setPreviousSteps(newPreviousSteps);
            setStep(2);
          }
        }

        setError("");
      } catch (err) {
        setError(
          "获取数据失败: " + (err.response?.data?.message || err.message)
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // 步骤展示
  const steps = ["选择职位", "选择简历", "开始分析"];

  // 处理职位点击
  const handleJobClick = (jobId) => {
    if (isCustomJobMode) return; // 自定义模式下不可选择列表
    setSelectedJobId(jobId);
  };

  // 处理简历点击
  const handleResumeClick = (resumeId) => {
    setSelectedResumeId(resumeId);
  };

  // 切换自定义职位模式
  const toggleCustomJobMode = () => {
    setIsCustomJobMode(!isCustomJobMode);
    if (!isCustomJobMode) {
      // 进入自定义模式时清除选中的职位
      setSelectedJobId("");
    } else {
      // 退出自定义模式时清除自定义内容和已解析内容
      setCustomJobText("");
      setParsedJob(null);
    }
  };

  // 解析自定义职位
  const parseCustomJob = async () => {
    if (!customJobText.trim()) {
      setError("请输入职位描述");
      return;
    }

    setIsParsingJob(true);
    setError(null);

    // 模拟AI分析进度
    simulateAnalysisProgress();

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "/api/jobs/parse",
        { jobText: customJobText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // 完成进度条动画后再显示结果
        setTimeout(() => {
          setParsedJob(response.data.data);
          setIsParsingJob(false);
        }, Math.max(0, 3000 - analysisProgress * 30)); // 确保至少展示3秒动画
      } else {
        setError(response.data.message || "解析失败，请重试");
        setIsParsingJob(false);
      }
    } catch (err) {
      console.error("解析职位描述失败:", err);
      setError(err.response?.data?.message || "解析失败，请重试");
      setIsParsingJob(false);
    }
  };

  // 模拟AI分析进度
  const simulateAnalysisProgress = () => {
    let progress = 0;
    const stages = [
      "预处理职位文本内容...",
      "识别职位名称与公司信息...",
      "提取核心职责与任职要求...",
      "分析技能要求与技术栈...",
      "提取福利待遇等补充信息...",
      "生成结构化职位数据...",
    ];

    const interval = setInterval(() => {
      if (progress >= 100) {
        clearInterval(interval);
        return;
      }

      progress += Math.random() * 3 + 1;
      progress = Math.min(progress, 100);

      // 根据进度更新阶段
      const stageIndex = Math.min(
        Math.floor(progress / (100 / stages.length)),
        stages.length - 1
      );

      setAnalysisProgress(progress);
      setAnalysisStage(stages[stageIndex]);
    }, 180);
  };

  // 保存解析的职位
  const saveCustomJob = async () => {
    if (!parsedJob) return;

    try {
      setLoadingAction(true);
      const token = localStorage.getItem("token");

      const response = await axios.post("/api/jobs", parsedJob, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        // 添加新保存的职位到列表
        setJobs([...jobs, response.data.data]);
        // 选中新保存的职位
        setSelectedJobId(response.data.data._id);
        // 退出自定义模式
        setIsCustomJobMode(false);
        setCustomJobText("");
        setParsedJob(null);
      } else {
        setError(response.data.message || "保存职位失败");
      }
    } catch (err) {
      setError("保存职位失败: " + (err.response?.data?.message || err.message));
    } finally {
      setLoadingAction(false);
    }
  };

  // 使用解析的职位但不保存
  const useWithoutSaving = () => {
    if (!parsedJob) return;

    // 创建临时职位ID
    const tempId = "temp_" + Date.now();
    // 设置选中的职位为临时职位
    setSelectedJobId(tempId);
    // 添加临时职位到本地状态
    setJobs([...jobs, { ...parsedJob, _id: tempId, isTemporary: true }]);
    // 退出自定义模式
    setIsCustomJobMode(false);
    setCustomJobText("");
    setParsedJob(null);
  };

  // 前往下一步
  const goNext = () => {
    if (step === 1 && !selectedJobId) {
      setError("请选择一个职位或创建自定义职位");
      return;
    }

    if (step === 2 && !selectedResumeId) {
      setError("请选择一个简历");
      return;
    }

    // 保存当前步骤
    const newPreviousSteps = [...previousSteps, step];
    setPreviousSteps(newPreviousSteps);

    // 前往下一步
    setStep(step + 1);
    setError("");
  };

  // 返回上一步
  const goBack = () => {
    if (previousSteps.length > 0) {
      // 获取上一步
      const newPreviousSteps = [...previousSteps];
      const prevStep = newPreviousSteps.pop();
      setPreviousSteps(newPreviousSteps);

      // 设置当前步骤
      setStep(prevStep);
      setError("");
    }
  };

  // 新增职位
  const goToAddJob = () => {
    navigate("/jobs/add");
  };

  // 新增简历
  const goToAddResume = () => {
    localStorage.setItem("returnToInterview", "true");
    if (selectedJobId) {
      localStorage.setItem("selectedJobId", selectedJobId);
    }
    navigate("/resumes/add");
  };

  // 开始分析
  const startAnalysis = async () => {
    if (!selectedResumeId || !selectedJobId) {
      setError("请选择职位和简历");
      return;
    }

    try {
      setLoadingAction(true);
      const token = localStorage.getItem("token");

      // 如果是临时职位，需要特殊处理
      const selectedJob = jobs.find((job) => job._id === selectedJobId);
      if (selectedJob?.isTemporary) {
        // 使用临时职位和简历创建分析
        const resume = resumes.find(
          (resume) => resume._id === selectedResumeId
        );
        // 这里应该做特殊处理，比如直接将职位对象传给后端而不是ID
        // 但为了保持一致性，我们可以先保存这个职位然后获取真实ID
        const jobResponse = await axios.post(
          "/api/jobs",
          { ...selectedJob, isTemporary: undefined },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // 使用保存后的职位ID
        if (jobResponse.data.success) {
          const realJobId = jobResponse.data.data._id;

          // 创建分析
          const response = await axios.post(
            "/api/analysis",
            {
              jobId: realJobId,
              resumeId: selectedResumeId,
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          // 导航到分析结果页面
          navigate(`/analysis/${response.data.data._id}`);
        } else {
          throw new Error(jobResponse.data.message || "保存临时职位失败");
        }
      } else {
        // 创建常规分析
        const response = await axios.post(
          "/api/analysis",
          {
            jobId: selectedJobId,
            resumeId: selectedResumeId,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // 导航到分析结果页面
        navigate(`/analysis/${response.data.data._id}`);
      }
    } catch (err) {
      setError("创建分析失败: " + (err.response?.data?.message || err.message));
      setLoadingAction(false);
    }
  };

  // 根据当前步骤渲染内容
  const renderStepContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    switch (step) {
      case 1:
        // 选择职位
        return (
          <Box>
            <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                选择一个职位进行分析
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={toggleCustomJobMode}
                  color={isCustomJobMode ? "primary" : "inherit"}
                >
                  {isCustomJobMode ? "返回职位列表" : "自定义职位描述"}
                </Button>
              </Box>

              {isCustomJobMode ? (
                <Box>
                  {!parsedJob ? (
                    <Box>
                      <TextField
                        label="输入职位描述"
                        multiline
                        rows={8}
                        fullWidth
                        value={customJobText}
                        onChange={(e) => setCustomJobText(e.target.value)}
                        placeholder="粘贴完整的职位描述，包括职责、要求、技能等信息..."
                        disabled={isParsingJob}
                        sx={{ mb: 2 }}
                      />

                      {isParsingJob ? (
                        <Box sx={{ width: "100%", mb: 3 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 1,
                            }}
                          >
                            <Typography variant="body2" sx={{ flexGrow: 1 }}>
                              {analysisStage}
                            </Typography>
                            <Typography variant="body2">
                              {Math.round(analysisProgress)}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={analysisProgress}
                            sx={{ height: 10, borderRadius: 5 }}
                          />
                        </Box>
                      ) : (
                        <Button
                          variant="contained"
                          onClick={parseCustomJob}
                          disabled={!customJobText.trim()}
                          sx={{ mb: 2 }}
                        >
                          解析职位描述
                        </Button>
                      )}
                    </Box>
                  ) : (
                    <Box>
                      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                        <Typography variant="h6">{parsedJob.title}</Typography>
                        <Typography variant="subtitle1">
                          {parsedJob.company}
                        </Typography>

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>职位描述:</strong>
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                          {parsedJob.description?.slice(0, 200)}
                          {parsedJob.description?.length > 200 ? "..." : ""}
                        </Typography>

                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>技术栈:</strong>{" "}
                          {Array.isArray(parsedJob.tech_stack)
                            ? parsedJob.tech_stack.join(", ")
                            : parsedJob.tech_stack || "未指定"}
                        </Typography>
                      </Paper>

                      <Box sx={{ display: "flex", gap: 2 }}>
                        <Button
                          variant="outlined"
                          onClick={() => {
                            setParsedJob(null);
                            setCustomJobText("");
                          }}
                        >
                          重新输入
                        </Button>
                        <Button
                          variant="contained"
                          onClick={saveCustomJob}
                          disabled={loadingAction}
                        >
                          保存职位
                        </Button>
                        <Button variant="outlined" onClick={useWithoutSaving}>
                          直接使用(不保存)
                        </Button>
                      </Box>
                    </Box>
                  )}
                </Box>
              ) : (
                <Box>
                  {jobs.length === 0 ? (
                    <Alert severity="info" sx={{ mb: 3 }}>
                      您没有保存的职位。请添加新职位或使用自定义职位功能。
                    </Alert>
                  ) : (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        从已保存的职位中选择：
                      </Typography>
                      <Box sx={{ maxHeight: "400px", overflow: "auto" }}>
                        {jobs.map((job) => (
                          <JobCard
                            key={job._id}
                            selected={job._id === selectedJobId}
                            onClick={() => handleJobClick(job._id)}
                          >
                            <CardContent>
                              <Typography variant="h6">{job.title}</Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {job.company}
                              </Typography>
                              <Typography variant="body2" sx={{ mt: 1 }}>
                                技术栈:{" "}
                                {Array.isArray(job.tech_stack)
                                  ? job.tech_stack.join(", ")
                                  : job.tech_stack || "未指定"}
                              </Typography>
                            </CardContent>
                          </JobCard>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              )}

              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={goNext}
                  disabled={!selectedJobId && !parsedJob}
                >
                  下一步
                </Button>
              </Box>
            </Paper>
          </Box>
        );

      case 2:
        // 选择简历
        return (
          <Box>
            <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                选择一份简历进行匹配分析
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Button
                  variant="outlined"
                  startIcon={<FileUpload />}
                  onClick={goToAddResume}
                >
                  上传新简历
                </Button>
              </Box>

              {resumes.length === 0 ? (
                <Alert severity="info" sx={{ mb: 3 }}>
                  您没有上传简历。请上传简历后继续。
                </Alert>
              ) : (
                <Box sx={{ maxHeight: "400px", overflow: "auto", mb: 3 }}>
                  {resumes.map((resume) => (
                    <ResumeCard
                      key={resume._id}
                      selected={resume._id === selectedResumeId}
                      onClick={() => handleResumeClick(resume._id)}
                    >
                      <CardContent>
                        <Typography variant="h6">
                          {resume.name ||
                            resume.basic_info?.fullName ||
                            "未命名简历"}
                        </Typography>
                        {resume.basic_info?.email && (
                          <Typography variant="body2" color="text.secondary">
                            {resume.basic_info.email}
                          </Typography>
                        )}
                      </CardContent>
                    </ResumeCard>
                  ))}
                </Box>
              )}

              <Box
                sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}
              >
                <Button variant="outlined" onClick={goBack}>
                  上一步
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={goNext}
                  disabled={!selectedResumeId}
                >
                  下一步
                </Button>
              </Box>
            </Paper>
          </Box>
        );

      case 3:
        // 确认并开始分析
        const confirmJob = jobs.find((job) => job._id === selectedJobId);
        const confirmResume = resumes.find(
          (resume) => resume._id === selectedResumeId
        );

        return (
          <Box>
            <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                准备分析匹配度
              </Typography>

              <Alert severity="info" sx={{ mt: 2, mb: 3 }}>
                我们将分析您的简历与所选职位的匹配程度，并提供详细的报告和改进建议。
              </Alert>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography
                    variant="subtitle1"
                    gutterBottom
                    fontWeight="bold"
                  >
                    所选职位:
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="h6">{confirmJob?.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {confirmJob?.company}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      技术栈:{" "}
                      {Array.isArray(confirmJob?.tech_stack)
                        ? confirmJob?.tech_stack.join(", ")
                        : confirmJob?.tech_stack || "未指定"}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography
                    variant="subtitle1"
                    gutterBottom
                    fontWeight="bold"
                  >
                    所选简历:
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="h6">
                      {confirmResume?.name || "简历"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {confirmResume?.basic_info?.fullName || ""}{" "}
                      {confirmResume?.basic_info?.email
                        ? `· ${confirmResume.basic_info.email}`
                        : ""}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Box
                sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}
              >
                <Button variant="outlined" onClick={goBack}>
                  上一步
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={startAnalysis}
                  disabled={loadingAction}
                  startIcon={
                    loadingAction ? (
                      <CircularProgress size={20} />
                    ) : (
                      <Assessment />
                    )
                  }
                >
                  {loadingAction ? "分析中..." : "开始分析"}
                </Button>
              </Box>
            </Paper>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" gutterBottom align="center">
        简历匹配度分析
      </Typography>
      <Typography variant="body1" paragraph align="center">
        分析您的简历与目标职位的匹配程度，获取专业改进建议
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Stepper activeStep={step - 1} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {renderStepContent()}
    </Container>
  );
};

export default AnalysisStartPage;
