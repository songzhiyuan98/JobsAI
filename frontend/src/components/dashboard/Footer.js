import { Github, Twitter, Linkedin } from "lucide-react";

// Footer Component
export default function Footer() {
  return (
    <footer
      id="about"
      className="w-full py-12 bg-white border-t border-gray-100"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold mb-4">
              <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                TalentSync
              </span>
            </h3>
            <p className="text-gray-600 mb-4 max-w-md">
              TalentSync
              是您的智能求职助手，通过AI技术帮助您优化简历、生成求职信，提高求职成功率。我们的使命是让人才与岗位实现"同步匹配"。
            </p>
            <div className="flex space-x-4">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600">
                <Github className="h-5 w-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-4">产品</h4>
            <ul className="space-y-2">
              <li>
                <a href="/#features" className="text-gray-600 hover:text-gray-900">
                  简历分析
                </a>
              </li>
              <li>
                <a href="/#features" className="text-gray-600 hover:text-gray-900">
                  求职信生成
                </a>
              </li>
              <li>
                <a href="/#features" className="text-gray-600 hover:text-gray-900">
                  职业规划
                </a>
              </li>
              <li>
                <a href="/#features" className="text-gray-600 hover:text-gray-900">
                  面试准备
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-4">公司</h4>
            <ul className="space-y-2">
              <li>
                <a href="/#about" className="text-gray-600 hover:text-gray-900">
                  关于我们
                </a>
              </li>
              <li>
                <a href="mailto:songzhiyuan98@gmail.com" className="text-gray-600 hover:text-gray-900">
                  联系我们
                </a>
              </li>
              <li>
                <a href="/#about" className="text-gray-600 hover:text-gray-900">
                  隐私政策
                </a>
              </li>
              <li>
                <a href="/#about" className="text-gray-600 hover:text-gray-900">
                  使用条款
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} TalentSync. 保留所有权利。
        </div>
      </div>
    </footer>
  );
}
