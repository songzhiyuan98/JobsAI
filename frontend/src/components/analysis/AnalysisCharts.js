import * as echarts from "echarts/core";
import { RadarChart, PieChart, BarChart, LineChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  ToolboxComponent,
} from "echarts/components";
import { LabelLayout, UniversalTransition } from "echarts/features";
import { CanvasRenderer } from "echarts/renderers";

// 注册ECharts必要的组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  ToolboxComponent,
  LabelLayout,
  UniversalTransition,
  RadarChart,
  PieChart,
  BarChart,
  LineChart,
  CanvasRenderer,
]);

// 初始化所有图表
export const initCharts = (chartRefs, activeTab, analysis, isDarkMode) => {
  // 清除现有图表实例
  disposeCharts(chartRefs);

  // 根据当前选项卡初始化相应图表
  if (activeTab === "summary" || activeTab === "skills") {
    if (chartRefs.radarChart.current && activeTab === "skills") {
      initRadarChart(chartRefs.radarChart.current, analysis, isDarkMode);
    }
    if (chartRefs.matchDistribution.current && activeTab === "summary") {
      initMatchDistributionChart(
        chartRefs.matchDistribution.current,
        analysis,
        isDarkMode
      );
    }
    if (chartRefs.skillComparison.current && activeTab === "skills") {
      initSkillComparisonChart(
        chartRefs.skillComparison.current,
        analysis,
        isDarkMode
      );
    }
  }

  if (activeTab === "history" && chartRefs.scoreHistory.current) {
    initScoreHistoryChart(chartRefs.scoreHistory.current, analysis, isDarkMode);
  }
};

// 清除图表实例
export const disposeCharts = (chartRefs) => {
  Object.values(chartRefs).forEach((ref) => {
    if (ref.current && echarts.getInstanceByDom(ref.current)) {
      echarts.getInstanceByDom(ref.current).dispose();
    }
  });
};

// 初始化雷达图
const initRadarChart = (domElement, analysis, isDarkMode) => {
  if (!domElement) return;

  const chart = echarts.init(domElement);

  // 提取数据
  const skills = analysis.skills || [
    { name: "编程技能", required: 85, candidate: 90 },
    { name: "数据分析", required: 70, candidate: 65 },
    { name: "系统设计", required: 75, candidate: 80 },
    { name: "项目管理", required: 60, candidate: 55 },
    { name: "沟通能力", required: 80, candidate: 85 },
  ];

  const indicator = skills.map((skill) => ({ name: skill.name, max: 100 }));

  const option = {
    tooltip: {
      trigger: "item",
    },
    legend: {
      data: ["职位要求", "候选人技能"],
      textStyle: {
        color: isDarkMode ? "#e5e7eb" : "#4b5563",
      },
    },
    radar: {
      indicator: indicator,
      radius: "65%",
      splitNumber: 5,
      axisName: {
        color: isDarkMode ? "#9ca3af" : "#6b7280",
      },
      splitLine: {
        lineStyle: {
          color: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        },
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: isDarkMode
            ? ["rgba(255, 255, 255, 0.02)", "rgba(255, 255, 255, 0.05)"]
            : ["rgba(0, 0, 0, 0.02)", "rgba(0, 0, 0, 0.05)"],
        },
      },
      axisLine: {
        lineStyle: {
          color: isDarkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)",
        },
      },
    },
    series: [
      {
        name: "技能匹配",
        type: "radar",
        data: [
          {
            value: skills.map((skill) => skill.required),
            name: "职位要求",
            lineStyle: {
              color: "#6366f1",
            },
            areaStyle: {
              color: "rgba(99, 102, 241, 0.2)",
            },
          },
          {
            value: skills.map((skill) => skill.candidate),
            name: "候选人技能",
            lineStyle: {
              color: "#10b981",
            },
            areaStyle: {
              color: "rgba(16, 185, 129, 0.2)",
            },
          },
        ],
      },
    ],
  };

  chart.setOption(option);
};

// 初始化匹配分布图
const initMatchDistributionChart = (domElement, analysis, isDarkMode) => {
  // ... 实现匹配分布图初始化逻辑 ...
};

// 初始化技能比较图
const initSkillComparisonChart = (domElement, analysis, isDarkMode) => {
  // ... 实现技能比较图初始化逻辑 ...
};

// 初始化历史分数图
const initScoreHistoryChart = (domElement, analysis, isDarkMode) => {
  // ... 实现历史分数图初始化逻辑 ...
};
