async function test() {
    try {
        const baseUrl = 'http://localhost:3000/api/v1';

        // 1. Signup
        console.log("1. Signing up user...");
        const signupRes = await fetch(`${baseUrl}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'testuser_demo3', password: 'password123' })
        });
        const signupData = await signupRes.json();
        console.log("Signup response:", signupData);

        // 2. Login
        console.log("\n2. Logging in...");
        const loginRes = await fetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'testuser_demo3', password: 'password123' })
        });
        const loginData = await loginRes.json();
        console.log("Login response:", loginData);

        if (!loginData.token) {
            throw new Error("Failed to get login token");
        }
        const token = loginData.token;

        // 3. LeetCode Profile
        console.log("\n3. Testing Leetcode fetch...");
        // Using a known LeetCode user name (e.g., 'talahanuman' or a standard demo user)
        const leetcodeRes = await fetch(`${baseUrl}/leetcode/getUserProfile/test`, {
            method: 'GET',
            headers: { 
                'Authorization': `Bearer ${token}` 
            }
        });
        const leetcodeData = await leetcodeRes.json();
        console.log("LeetCode response:", leetcodeData);

        // 4. GitHub Score
        console.log("\n4. Testing GitHub score...");
        const githubRes = await fetch(`${baseUrl}/github/GithubUserProfile/octocat?systemdesign_score=2&internship_score=3`, {
            method: 'GET',
            headers: { 
                'Authorization': `Bearer ${token}` 
            }
        });
        const githubData = await githubRes.json();
        console.log("GitHub response:", githubData);

        // 5. Prediction
        console.log("\n5. Testing Prediction route...");
        const predRes = await fetch(`${baseUrl}/model/prediction`, {
            method: 'GET',
            headers: { 
                'Authorization': `Bearer ${token}` 
            }
        });
        const predData = await predRes.json();
        console.log("Prediction response:", predData);

    } catch (error) {
        console.error("Test pipeline failed:", error);
    }
}

test();
