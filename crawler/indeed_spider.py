import requests
from bs4 import BeautifulSoup
import time
import random
import json
import os
from datetime import datetime
from pymongo import MongoClient
from dotenv import load_dotenv
import re
from urllib.parse import urlencode
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options

# 加载环境变量
load_dotenv()

# MongoDB 连接
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017')
client = MongoClient(MONGO_URI)
db = client['ai_interview_assistant']
jobs_collection = db['jobs']

# 搜索关键词列表
SEARCH_KEYWORDS = [
    "Software Engineer",
    "Full Stack Developer",
    "Frontend Developer",
    "Backend Developer",
    "DevOps Engineer",
    "Data Engineer",
    "Machine Learning Engineer",
    "AI Engineer",
    "Mobile Developer",
    "iOS Developer",
    "Android Developer",
    "React Developer",
    "Node.js Developer",
    "Python Developer",
    "Java Developer"
]

# 搜索地点列表
LOCATIONS = [
    "Remote",
    "San Francisco, CA",
    "New York, NY",
    "Seattle, WA",
    "Austin, TX",
    "Boston, MA",
    "Chicago, IL"
]

# 请求头，模拟浏览器访问
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Referer': 'https://www.indeed.com/',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Cache-Control': 'max-age=0',
}

def parse_posted_date(date_text):
    """解析Indeed发布日期文本，转换为天数"""
    if "just posted" in date_text.lower() or "today" in date_text.lower():
        return 0
    elif "yesterday" in date_text.lower():
        return 1
    else:
        # 尝试提取"X days ago"中的天数
        days_match = re.search(r'(\d+)\s+day', date_text)
        if days_match:
            return int(days_match.group(1))
    return None

def get_job_listings(keyword, location, page=0, days_ago=None):
    """获取Indeed上的职位列表，可选择最近几天发布的"""
    
    # 构建URL
    base_url = "https://www.indeed.com/jobs"
    params = {
        'q': keyword,
        'l': location,
        'start': page * 10  # Indeed每页显示10个结果
    }
    
    # 添加日期筛选
    if days_ago:
        params['fromage'] = days_ago  # fromage参数指定最近几天发布的职位
    
    # 使用 urllib.parse 代替 requests.utils.quote
    url = f"{base_url}?{urlencode(params)}"
    
    print(f"Scraping: {url}")
    
    try:
        response = requests.get(url, headers=HEADERS)
        response.raise_for_status()  # 如果请求失败，抛出异常
        
        soup = BeautifulSoup(response.text, 'html.parser')
        job_cards = soup.select('div.job_seen_beacon')
        
        jobs = []
        for card in job_cards:
            try:
                # 提取职位标题
                title_elem = card.select_one('h2.jobTitle span[title]')
                title = title_elem.get('title') if title_elem else "N/A"
                
                # 提取公司名称
                company_elem = card.select_one('span.companyName')
                company = company_elem.text.strip() if company_elem else "N/A"
                
                # 提取位置
                location_elem = card.select_one('div.companyLocation')
                job_location = location_elem.text.strip() if location_elem else "N/A"
                
                # 提取职位链接
                job_link_elem = card.select_one('h2.jobTitle a')
                job_id = job_link_elem.get('data-jk') if job_link_elem else None
                job_link = f"https://www.indeed.com/viewjob?jk={job_id}" if job_id else "N/A"
                
                # 提取职位描述摘要
                snippet_elem = card.select_one('div.job-snippet')
                snippet = snippet_elem.text.strip() if snippet_elem else "N/A"
                
                # 提取发布日期
                date_elem = card.select_one('span.date')
                posted_date = date_elem.text.strip() if date_elem else "N/A"
                
                # 解析发布天数
                days = parse_posted_date(posted_date)
                
                # 创建职位对象
                job = {
                    'title': title,
                    'company': company,
                    'location': job_location,
                    'url': job_link,
                    'snippet': snippet,
                    'posted_date': posted_date,
                    'days_ago': days,
                    'source': 'Indeed',
                    'keywords': [keyword],
                    'search_location': location,
                    'scraped_date': datetime.now().isoformat(),
                    'job_id': job_id
                }
                
                jobs.append(job)
                
            except Exception as e:
                print(f"Error parsing job card: {e}")
                continue
        
        return jobs
    
    except Exception as e:
        print(f"Error fetching job listings: {e}")
        return []

def get_job_details(job_url):
    """获取职位详细信息"""
    
    try:
        response = requests.get(job_url, headers=HEADERS)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # 提取完整职位描述
        description_elem = soup.select_one('div#jobDescriptionText')
        description = description_elem.text.strip() if description_elem else "N/A"
        
        # 提取职位要求（可能需要根据实际HTML结构调整）
        requirements = []
        req_lists = soup.select('div#jobDescriptionText ul li')
        for req in req_lists:
            req_text = req.text.strip()
            if len(req_text) > 10:  # 过滤掉太短的内容
                requirements.append(req_text)
        
        return {
            'description': description,
            'requirements': requirements
        }
    
    except Exception as e:
        print(f"Error fetching job details: {e}")
        return {
            'description': "Failed to fetch",
            'requirements': []
        }

def save_to_mongodb(job):
    """保存职位信息到MongoDB"""
    
    try:
        # 检查是否已存在相同的职位（基于job_id）
        existing_job = jobs_collection.find_one({'job_id': job['job_id']})
        
        if existing_job:
            # 更新现有记录
            jobs_collection.update_one(
                {'job_id': job['job_id']},
                {'$set': job}
            )
            print(f"Updated job: {job['title']} at {job['company']}")
        else:
            # 插入新记录
            jobs_collection.insert_one(job)
            print(f"Saved new job: {job['title']} at {job['company']}")
    
    except Exception as e:
        print(f"Error saving to MongoDB: {e}")

def get_job_listings_selenium(keyword, location, page=0, days_ago=7):
    """使用 Selenium 获取 Indeed 职位列表，支持分页"""
    
    options = Options()
    options.add_argument("--headless")  # 无界面模式
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36")
    
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    
    try:
        # 构建 URL，添加分页参数
        base_url = "https://www.indeed.com/jobs"
        start_param = page * 10  # Indeed 每页 10 个结果
        url = f"{base_url}?q={keyword.replace(' ', '+')}&l={location.replace(' ', '+')}&start={start_param}&fromage={days_ago}"
        
        print(f"Scraping: {url} (页码 {page+1})")
        driver.get(url)
        
        # 等待页面加载
        time.sleep(random.uniform(3, 5))
        
        # 获取页面内容
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        
        # 检查页面标题，判断是否被反爬
        page_title = soup.title.text if soup.title else "无标题"
        print(f"页面标题: {page_title}")
        
        # 尝试不同的选择器
        selectors = [
            'div.job_seen_beacon',
            'div.tapItem',
            'div.jobsearch-ResultsList > div.cardOutline',
            'div[data-testid="job-card"]'
        ]
        
        job_cards = []
        for selector in selectors:
            cards = soup.select(selector)
            if cards:
                job_cards = cards
                print(f"选择器 '{selector}' 找到 {len(cards)} 个职位")
                break
        
        if not job_cards:
            print("警告: 未找到任何职位卡片，可能需要处理验证码或网页结构已更改")
            return []
        
        jobs = []
        for card in job_cards:
            try:
                # 提取职位标题
                title_elem = card.select_one('h2.jobTitle span[title], a.jcs-JobTitle span[title]')
                title = title_elem.get('title') if title_elem else "N/A"
                
                # 如果没找到标题，尝试其他选择器
                if title == "N/A":
                    title_elem = card.select_one('h2.jobTitle, a.jcs-JobTitle')
                    title = title_elem.text.strip() if title_elem else "N/A"
                
                # 提取公司名称
                company_elem = card.select_one('span.companyName, div.company_location .companyName')
                company = company_elem.text.strip() if company_elem else "N/A"
                
                # 调试输出
                print(f"找到职位: {title} at {company}")
                
                # 提取位置
                location_elem = card.select_one('div.companyLocation')
                job_location = location_elem.text.strip() if location_elem else "N/A"
                
                # 提取职位链接
                job_link_elem = card.select_one('h2.jobTitle a')
                job_id = job_link_elem.get('data-jk') if job_link_elem else None
                job_link = f"https://www.indeed.com/viewjob?jk={job_id}" if job_id else "N/A"
                
                # 提取职位描述摘要
                snippet_elem = card.select_one('div.job-snippet')
                snippet = snippet_elem.text.strip() if snippet_elem else "N/A"
                
                # 提取发布日期
                date_elem = card.select_one('span.date')
                posted_date = date_elem.text.strip() if date_elem else "N/A"
                
                # 解析发布天数
                days = parse_posted_date(posted_date)
                
                # 创建职位对象
                job = {
                    'title': title,
                    'company': company,
                    'location': job_location,
                    'url': job_link,
                    'snippet': snippet,
                    'posted_date': posted_date,
                    'days_ago': days,
                    'source': 'Indeed',
                    'keywords': [keyword],
                    'search_location': location,
                    'scraped_date': datetime.now().isoformat(),
                    'job_id': job_id
                }
                
                jobs.append(job)
                
            except Exception as e:
                print(f"Error parsing job card: {e}")
                continue
        
        print(f"总计找到 {len(jobs)} 个职位")
        return jobs
    
    finally:
        driver.quit()

def main():
    """主函数，执行爬虫任务"""
    
    print("Starting Indeed job scraper...")
    
    # 设置日期筛选（1=今天, 3=3天内, 7=一周内, 14=两周内）
    days_ago = 7  # 获取最近一周发布的职位
    
    for keyword in SEARCH_KEYWORDS:
        for location in LOCATIONS:
            print(f"\nSearching for '{keyword}' in '{location}' posted in last {days_ago} days")
            
            # 爬取前3页结果，正确传递页码参数
            for page in range(3):
                print(f"\n--- 处理第 {page+1} 页 ---")
                jobs = get_job_listings_selenium(keyword, location, page, days_ago)
                
                saved_count = 0
                for job in jobs:
                    # 获取详细信息
                    if job['url'] != "N/A":
                        print(f"Getting details for: {job['title']}")
                        details = get_job_details(job['url'])
                        job.update(details)
                    
                    # 保存到数据库
                    save_to_mongodb(job)
                    saved_count += 1
                    
                    # 随机延迟，避免被封IP
                    time.sleep(random.uniform(1, 3))
                
                print(f"第 {page+1} 页处理完成，保存了 {saved_count} 个职位")
                
                # 页面之间的延迟
                time.sleep(random.uniform(3, 5))
    
    print("\nJob scraping completed!")

if __name__ == "__main__":
    main()
