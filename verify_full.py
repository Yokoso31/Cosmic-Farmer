from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        errors = []
        page.on("pageerror", lambda err: errors.append(f"Page Error: {err.message}"))
        page.on("console", lambda msg: errors.append(f"Console Error: {msg.text}") if msg.type == "error" else None)

        print("Navigating...")
        page.goto("http://localhost:8000/index.html")
        page.wait_for_selector("#clicker-btn")

        # 1. Verify Click
        print("Testing Click...")
        initial_money = int(page.inner_text("#money"))
        page.click("#clicker-btn")
        time.sleep(0.5)
        new_money = int(page.inner_text("#money"))
        if new_money > initial_money:
            print("PASS: Click increased money.")
        else:
            print(f"FAIL: Click did not increase money. {initial_money} -> {new_money}")

        # 2. Verify Tab Switching & Rendering
        print("Testing Tabs...")
        tabs = ["farm", "tech", "space", "companions", "dna", "codex"]
        for t in tabs:
            print(f"Switching to {t}...")
            # Use the selector we expect to work now
            page.click(f".tab-btn[data-tab='{t}']")
            time.sleep(0.2)

            # Check if content updated
            content = page.inner_html("#shop-content")
            if len(content.strip()) == 0:
                print(f"FAIL: Shop content empty for {t}")
            else:
                print(f"PASS: Shop content rendered for {t}")

        # 3. Verify Buying (Functional Menu)
        print("Testing Buy Plot...")
        # Give money
        page.evaluate("import('./js/state.js').then(m => m.game.money = 1000)")
        # Go to farm
        page.click(f".tab-btn[data-tab='farm']")
        time.sleep(0.2)
        # Buy
        page.click("#shop-item-plot")
        time.sleep(0.2)
        plots = int(page.inner_text("#plot-count"))
        if plots > 0:
            print("PASS: Bought plot.")
        else:
            print("FAIL: Plot count did not increase.")

        # 4. Check for accumulated errors
        if len(errors) > 0:
            print("ERRORS FOUND:")
            for e in errors:
                print(e)
        else:
            print("No console errors.")

        browser.close()

if __name__ == "__main__":
    run()
