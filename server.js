// server.js
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const port = 3000;

// 使用中間件
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// 應用設定
let appSettings = {
    databaseEnabled: true,
    databaseType: 'sqlite',
    inMemoryData: []
};

// 設定API端點
app.get('/settings', (req, res) => {
    res.json(appSettings);
});

app.post('/settings', (req, res) => {
    appSettings = {
        ...appSettings,
        ...req.body
    };
    res.json({ success: true });
});

// 初始化資料庫
const db = new sqlite3.Database('./prompts.db', (err) => {
    if (err) {
        console.error('無法連接到資料庫', err);
    } else {
        console.log('成功連接到SQLite資料庫');
        // 創建資料表
        db.run(`CREATE TABLE IF NOT EXISTS prompts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            programming_language TEXT,
            other_language TEXT,
            project_type TEXT,
            other_project_type TEXT,
            architecture TEXT,
            other_architecture TEXT,
            functionality TEXT,
            dependencies TEXT,
            compatibility TEXT,
            performance TEXT,
            security TEXT,
            ide TEXT,
            other_ide TEXT,
            version_control TEXT,
            other_version_control TEXT,
            testing_framework TEXT,
            other_testing_framework TEXT,
            deployment TEXT,
            other_deployment TEXT,
            naming_convention TEXT,
            other_naming_convention TEXT,
            code_formatting TEXT,
            comment_style TEXT,
            other_comment_style TEXT,
            error_handling TEXT,
            other_error_handling TEXT,
            optimization TEXT,
            scalability TEXT,
            algorithms TEXT,
            extra_requirements TEXT,
            generated_prompt TEXT,
            timestamp TEXT
        )`);
    }
});

// API端點：保存提示詞
app.post('/save-prompt', (req, res) => {
    const data = req.body;
    
    if (appSettings.databaseEnabled) {
        // 使用資料庫儲存
        const sql = `INSERT INTO prompts (
            programming_language, other_language, project_type, other_project_type,
            architecture, other_architecture, functionality, dependencies,
            compatibility, performance, security, ide, other_ide,
            version_control, other_version_control, testing_framework, other_testing_framework,
            deployment, other_deployment, naming_convention, other_naming_convention,
            code_formatting, comment_style, other_comment_style, error_handling, other_error_handling,
            optimization, scalability, algorithms, extra_requirements, generated_prompt, timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        const params = [
            data.programmingLanguage, data.otherLanguage, data.projectType, data.otherProjectType,
            data.architecture, data.otherArchitecture, data.functionality, data.dependencies,
            data.compatibility, data.performance, data.security, data.ide, data.otherIde,
            data.versionControl, data.otherVersionControl, data.testingFramework, data.otherTestingFramework,
            data.deployment, data.otherDeployment, data.namingConvention, data.otherNamingConvention,
            data.codeFormatting, data.commentStyle, data.otherCommentStyle, data.errorHandling, data.otherErrorHandling,
            data.optimization, data.scalability, data.algorithms, data.extraRequirements, data.generatedPrompt, data.timestamp
        ];
        
        db.run(sql, params, function(err) {
            if (err) {
                console.error('儲存資料時出錯:', err);
                res.json({ success: false, message: err.message });
            } else {
                console.log(`提示詞已儲存，ID: ${this.lastID}`);
                res.json({ success: true, id: this.lastID });
            }
        });
    } else {
        // 使用記憶體儲存
        const id = Date.now().toString();
        const prompt = {
            id,
            ...data,
            timestamp: new Date().toISOString()
        };
        appSettings.inMemoryData.push(prompt);
        console.log(`提示詞已儲存到記憶體，ID: ${id}`);
        res.json({ success: true, id });
    }
});

// API端點：取得所有提示詞
app.get('/prompts', (req, res) => {
    if (appSettings.databaseEnabled) {
        db.all("SELECT id, programming_language, project_type, functionality, timestamp FROM prompts ORDER BY timestamp DESC", [], (err, rows) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ data: rows });
        });
    } else {
        // 從記憶體獲取數據
        const prompts = appSettings.inMemoryData.map(p => ({
            id: p.id,
            programming_language: p.programmingLanguage,
            project_type: p.projectType,
            functionality: p.functionality,
            timestamp: p.timestamp
        })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        res.json({ data: prompts });
    }
});

// API端點：取得單一提示詞
app.get('/prompts/:id', (req, res) => {
    const id = req.params.id;
    if (appSettings.databaseEnabled) {
        db.get("SELECT * FROM prompts WHERE id = ?", [id], (err, row) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ data: row });
        });
    } else {
        // 從記憶體獲取數據
        const prompt = appSettings.inMemoryData.find(p => p.id === id);
        if (prompt) {
            res.json({ data: prompt });
        } else {
            res.status(404).json({ error: '提示詞未找到' });
        }
    }
});

// API端點：更新提示詞
app.put('/prompts/:id', (req, res) => {
    const id = req.params.id;
    const data = req.body;
    
    const sql = `UPDATE prompts SET
        programming_language = ?, other_language = ?, project_type = ?, other_project_type = ?,
        architecture = ?, other_architecture = ?, functionality = ?, dependencies = ?,
        compatibility = ?, performance = ?, security = ?, ide = ?, other_ide = ?,
        version_control = ?, other_version_control = ?, testing_framework = ?, other_testing_framework = ?,
        deployment = ?, other_deployment = ?, naming_convention = ?, other_naming_convention = ?,
        code_formatting = ?, comment_style = ?, other_comment_style = ?, error_handling = ?, other_error_handling = ?,
        optimization = ?, scalability = ?, algorithms = ?, extra_requirements = ?, generated_prompt = ?
        WHERE id = ?`;
    
    const params = [
        data.programmingLanguage, data.otherLanguage, data.projectType, data.otherProjectType,
        data.architecture, data.otherArchitecture, data.functionality, data.dependencies,
        data.compatibility, data.performance, data.security, data.ide, data.otherIde,
        data.versionControl, data.otherVersionControl, data.testingFramework, data.otherTestingFramework,
        data.deployment, data.otherDeployment, data.namingConvention, data.otherNamingConvention,
        data.codeFormatting, data.commentStyle, data.otherCommentStyle, data.errorHandling, data.otherErrorHandling,
        data.optimization, data.scalability, data.algorithms, data.extraRequirements, data.generatedPrompt,
        id
    ];
    
    db.run(sql, params, function(err) {
        if (err) {
            console.error('更新資料時出錯:', err);
            res.json({ success: false, message: err.message });
        } else {
            console.log(`提示詞已更新，ID: ${id}`);
            res.json({ success: true, id: id });
        }
    });
});

// API端點：刪除提示詞
app.delete('/prompts/:id', (req, res) => {
    const id = req.params.id;
    
    db.run('DELETE FROM prompts WHERE id = ?', id, function(err) {
        if (err) {
            console.error('刪除資料時出錯:', err);
            res.json({ success: false, message: err.message });
        } else {
            console.log(`提示詞已刪除，ID: ${id}`);
            res.json({ success: true });
        }
    });
});

// 啟動伺服器
app.listen(port, () => {
    console.log(`伺服器執行於 http://localhost:${port}`);
});
