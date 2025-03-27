import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Typography,
  Paper,
  Box,
  Divider,
  Chip,
  Grid,
  CircularProgress,
  Alert,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  LinearProgress,
} from "@mui/material";
import {
  CheckCircle,
  Cancel,
  QuestionAnswer,
  Build,
  ArrowUpward,
  ArrowBack,
  Description,
  Work,
} from "@mui/icons-material";
import ReactMarkdown from "react-markdown";

// 匹配分数显示组件
const MatchScore = ({ score }) => {
  const getColor = (score) => {
    if (score >= 80) return "success.main";
    if (score >= 60) return "warning.main";
    return "error.main";
  };

  return (
    <Box
      sx={{
        position: "relative",
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Box sx={{ position: "relative", display: "inline-flex" }}>
        <CircularProgress
          variant="determinate"
          value={100}
          size={120}
          thickness={4}
          sx={{ color: "grey.300" }}
        />
        <CircularProgress
          variant="determinate"
          value={score}
          size={120}
          thickness={4}
          sx={{
            color: getColor(score),
            position: "absolute",
            left: 0,
          }}
        />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: "absolute",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="h4" component="div" color={getColor(score)}>
            {score}
          </Typography>
        </Box>
      </Box>
      <Typography variant="body2" sx={{ mt: 1 }}>
        匹配分数
      </Typography>
    </Box>
  );
};

// 匹配概率指示器
const MatchProbability = ({ probability }) => {
  const getColor = (prob) => {
    if (prob === "高") return "success";
    if (prob === "中") return "warning";
    return "error";
  };

  return (
    <Chip
      label={`面试概率: ${probability}`}
      color={getColor(probability)}
      sx={{ fontWeight: "bold", fontSize: "1rem" }}
    />
  );
};

const AnalysisResultPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.get(`/api/analysis/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          setAnalysis(response.data.data);
        } else {
          setError("获取分析结果失败");
        }
      } catch (err) {
        setError(
          "获取分析结果失败: " + (err.response?.data?.message || err.message)
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [id]);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          正在加载分析报告...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate("/dashboard")}
        >
          返回仪表板
        </Button>
      </Container>
    );
  }

  if (!analysis) {
    return (
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          找不到分析报告
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate("/dashboard")}
        >
          返回仪表板
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      <Button
        variant="outlined"
        startIcon={<ArrowBack />}
        onClick={() => navigate("/dashboard")}
        sx={{ mb: 3 }}
      >
        返回仪表板
      </Button>

      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          简历匹配分析报告
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "center", mt: 3, mb: 4 }}>
          <MatchScore score={analysis.matchScore} />
        </Box>

        <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
          <MatchProbability probability={analysis.matchProbability} />
        </Box>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: "100%" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Work sx={{ mr: 1, color: "primary.main" }} />
                  <Typography variant="h6">职位信息</Typography>
                </Box>
                <Typography variant="body1" gutterBottom>
                  <strong>职位:</strong> {analysis.job?.title || "未指定"}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>公司:</strong> {analysis.job?.company || "未指定"}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>技术栈:</strong>{" "}
                  {Array.isArray(analysis.job?.tech_stack)
                    ? analysis.job?.tech_stack.join(", ")
                    : analysis.job?.tech_stack || "未指定"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: "100%" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Description sx={{ mr: 1, color: "primary.main" }} />
                  <Typography variant="h6">简历信息</Typography>
                </Box>
                <Typography variant="body1" gutterBottom>
                  <strong>姓名:</strong>{" "}
                  {analysis.resume?.basicInfo?.fullName || "未指定"}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>邮箱:</strong>{" "}
                  {analysis.resume?.basicInfo?.email || "未指定"}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>技能:</strong>{" "}
                  {analysis.resume?.skills
                    ?.flatMap((s) => (Array.isArray(s.items) ? s.items : []))
                    .join(", ") || "未指定"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, mb: 4, height: "100%" }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: "flex", alignItems: "center" }}
            >
              <CheckCircle sx={{ mr: 1, color: "success.main" }} />
              简历优势
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List>
              {analysis.strengths.map((strength, index) => (
                <ListItem key={index} sx={{ pl: 0 }}>
                  <ListItemIcon sx={{ minWidth: "36px" }}>
                    <CheckCircle color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={strength} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, mb: 4, height: "100%" }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: "flex", alignItems: "center" }}
            >
              <Cancel sx={{ mr: 1, color: "error.main" }} />
              简历不足
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List>
              {analysis.weaknesses.map((weakness, index) => (
                <ListItem key={index} sx={{ pl: 0 }}>
                  <ListItemIcon sx={{ minWidth: "36px" }}>
                    <Cancel color="error" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={weakness} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ display: "flex", alignItems: "center" }}
        >
          <Work sx={{ mr: 1, color: "primary.main" }} />
          职位关键要求
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <List>
          {analysis.keyRequirements.map((requirement, index) => (
            <ListItem key={index} sx={{ pl: 0 }}>
              <ListItemIcon sx={{ minWidth: "36px" }}>
                <Work color="primary" fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={requirement} />
            </ListItem>
          ))}
        </List>
      </Paper>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ display: "flex", alignItems: "center" }}
        >
          <QuestionAnswer sx={{ mr: 1, color: "info.main" }} />
          可能的面试问题
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <List>
          {analysis.possibleQuestions.map((question, index) => (
            <ListItem key={index} sx={{ pl: 0 }}>
              <ListItemIcon sx={{ minWidth: "36px" }}>
                <QuestionAnswer color="info" fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={question} />
            </ListItem>
          ))}
        </List>
      </Paper>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ display: "flex", alignItems: "center" }}
        >
          <ArrowUpward sx={{ mr: 1, color: "success.main" }} />
          简历优化建议
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <List>
          {analysis.improvementSuggestions.map((suggestion, index) => (
            <ListItem key={index} sx={{ pl: 0 }}>
              <ListItemIcon sx={{ minWidth: "36px" }}>
                <Build color="warning" fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={suggestion} />
            </ListItem>
          ))}
        </List>
      </Paper>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          完整分析报告
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
          <ReactMarkdown>{analysis.rawAnalysis}</ReactMarkdown>
        </Box>
      </Paper>
    </Container>
  );
};

export default AnalysisResultPage;
