const axios = require("axios");
require("dotenv").config();
const Job = require("../models/Job"); // 从模型文件导入

// JSSearch API 配置
const JSEARCH_API_KEY =
  process.env.JSEARCH_API_KEY ||
  "5a1db1e5f0mshb38af52238c4a71p136bb3jsn0cf47ad3e210";
const JSEARCH_HOST = "jsearch.p.rapidapi.com";

// 搜索参数 - 专注于湾区实习/初级职位
const SEARCH_KEYWORDS = [
  "Software Engineer Intern",
  "SDE Intern",
  "Full Stack Intern",
  "Software Engineering Intern",
  "Entry Level Software Engineer",
];

const LOCATIONS = [
  "Silicon Valley, CA",
  "San Jose, CA",
  "Mountain View, CA",
  "Palo Alto, CA",
  "Sunnyvale, CA",
];

/**
 * 从 JSSearch API 获取职位
 * @param {string} query - 搜索关键词
 * @param {string} location - 位置
 * @param {number} page - 页码
 * @returns {Promise<Array>} - 职位列表
 */
async function getJobs(query, location, page = 1) {
  const url = "https://jsearch.p.rapidapi.com/search";

  const options = {
    method: "GET",
    url: url,
    params: {
      query: `${query} in ${location}`,
      page: page.toString(),
      num_pages: "1",
      date_posted: "week", // 最近一周发布的职位
    },
    headers: {
      "X-RapidAPI-Key": JSEARCH_API_KEY,
      "X-RapidAPI-Host": JSEARCH_HOST,
    },
  };

  console.log(`正在搜索: ${query} 在 ${location} (第${page}页)`);

  try {
    const response = await axios.request(options);
    const data = response.data;

    if (data.status !== "OK") {
      console.error(`API返回错误: ${data.message || "未知错误"}`);
      return [];
    }

    const jobsData = data.data || [];
    console.log(`找到 ${jobsData.length} 个职位`);

    return jobsData.map((job) => ({
      title: job.job_title,
      company: job.employer_name,
      location: `${job.job_city || ""}, ${job.job_state || ""}`.trim(),
      url: job.job_apply_link,
      snippet: job.job_description
        ? job.job_description.substring(0, 200) + "..."
        : "",
      posted_date: job.job_posted_at_datetime_utc,
      source: job.job_publisher,
      keywords: [query],
      search_location: location,
      scraped_date: new Date(),
      job_id: job.job_id,
      description: job.job_description,
      requirements: job.job_required_skills || [],
      salary_min: job.job_min_salary,
      salary_max: job.job_max_salary,
      salary_currency: job.job_salary_currency,
      employment_type: job.job_employment_type,
    }));
  } catch (error) {
    console.error(`获取职位失败: ${error.message}`);
    return [];
  }
}

/**
 * 保存职位到 MongoDB
 * @param {Object} job - 职位信息
 * @returns {Promise<Object>} - 保存结果
 */
async function saveToMongoDB(job) {
  try {
    // 查找是否存在相同职位
    const existingJob = await Job.findOne({ job_id: job.job_id });

    if (existingJob) {
      // 更新现有记录
      const result = await Job.updateOne({ job_id: job.job_id }, job);
      console.log(`更新职位: ${job.title} at ${job.company}`);
      return { updated: true, job: job.title };
    } else {
      // 插入新记录
      const newJob = new Job(job);
      await newJob.save();
      console.log(`保存新职位: ${job.title} at ${job.company}`);
      return { inserted: true, job: job.title };
    }
  } catch (error) {
    console.error(`保存到MongoDB时出错: ${error.message}`);
    return { error: error.message };
  }
}

/**
 * 获取并保存所有职位
 */
async function fetchAllJobs() {
  console.log("开始获取职位数据...");

  for (const keyword of SEARCH_KEYWORDS) {
    for (const location of LOCATIONS) {
      console.log(`\n搜索关键词 '${keyword}' 地点 '${location}'`);

      // 只获取第1页数据，每页通常有10-15个结果
      const jobs = await getJobs(keyword, location, 1);

      // 保存到数据库
      for (const job of jobs) {
        await saveToMongoDB(job);
      }

      // API 限速控制
      console.log("等待 API 限速...");
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  console.log("\n职位数据获取完成!");
}

/**
 * 智能获取职位 - 优化API调用次数和结果相关性
 */
async function smartFetchBayAreaInternships() {
  console.log("开始智能获取湾区实习职位...");

  // 优先搜索组合 - 最重要的关键词+地点组合
  const priorityCombinations = [
    { keyword: "Software Engineer Intern", location: "Silicon Valley, CA" },
    { keyword: "Software Engineering Intern", location: "San Jose, CA" },
    { keyword: "Full Stack Intern", location: "Palo Alto, CA" },
    { keyword: "SDE Intern", location: "Mountain View, CA" },
  ];

  const today = new Date();
  const threeDaysAgo = new Date(today);
  threeDaysAgo.setDate(today.getDate() - 3);

  // 1. 首先获取最近3天的职位
  console.log("\n获取最近3天发布的职位");
  for (const combo of priorityCombinations) {
    console.log(`\n搜索近期职位: ${combo.keyword} 在 ${combo.location}`);

    const url = "https://jsearch.p.rapidapi.com/search";
    const options = {
      method: "GET",
      url: url,
      params: {
        query: `${combo.keyword} in ${combo.location}`,
        page: "1",
        num_pages: "1",
        date_posted: "week", // 最近一周发布的职位
        country: "us", // 添加国家参数
      },
      headers: {
        "X-RapidAPI-Key": JSEARCH_API_KEY,
        "X-RapidAPI-Host": JSEARCH_HOST,
      },
    };

    try {
      const response = await axios.request(options);
      const data = response.data;

      if (data.status === "OK") {
        const jobsData = data.data || [];
        console.log(`找到 ${jobsData.length} 个近期职位`);

        const jobs = jobsData.map((job) => ({
          title: job.job_title,
          company: job.employer_name,
          location: `${job.job_city || ""}, ${job.job_state || ""}`.trim(),
          url: job.job_apply_link,
          snippet: job.job_description
            ? job.job_description.substring(0, 200) + "..."
            : "",
          posted_date: job.job_posted_at_datetime_utc,
          source: job.job_publisher,
          keywords: [combo.keyword],
          search_location: combo.location,
          scraped_date: new Date(),
          job_id: job.job_id,
          description: job.job_description,
          requirements: job.job_required_skills || [],
          salary_min: job.job_min_salary,
          salary_max: job.job_max_salary,
          salary_currency: job.job_salary_currency,
          employment_type: job.job_employment_type,
        }));

        // 保存到数据库
        for (const job of jobs) {
          await saveToMongoDB(job);
        }
      }
    } catch (error) {
      console.error(`获取职位失败: ${error.message}`);
    }

    // API 限速控制 - 增加到至少10秒
    await new Promise((resolve) => setTimeout(resolve, 10000));
  }

  // 2. 补充一周内的其他职位
  console.log("\n补充一周内的其他职位");

  // 随机选择一些搜索组合，避免过多API调用
  const allCombinations = [];
  for (const keyword of SEARCH_KEYWORDS) {
    for (const location of LOCATIONS) {
      // 跳过已经处理过的优先组合
      if (
        !priorityCombinations.some(
          (c) => c.keyword === keyword && c.location === location
        )
      ) {
        allCombinations.push({ keyword, location });
      }
    }
  }

  // 随机选择最多6个组合
  const selectedCombinations = allCombinations
    .sort(() => 0.5 - Math.random())
    .slice(0, Math.min(6, allCombinations.length));

  for (const combo of selectedCombinations) {
    console.log(`\n搜索一周内职位: ${combo.keyword} 在 ${combo.location}`);
    const jobs = await getJobs(combo.keyword, combo.location, 1);

    // 保存到数据库
    for (const job of jobs) {
      await saveToMongoDB(job);
    }

    // API 限速控制
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  console.log("\n湾区实习职位获取完成!");
}

// 导出函数供路由使用
module.exports = {
  fetchAllJobs,
  smartFetchBayAreaInternships,
  getJobs,
  saveToMongoDB,
};
