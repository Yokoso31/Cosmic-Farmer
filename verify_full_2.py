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

        # 3. Verify Buying Plot (Farm)
        print("Testing Buy Plot...")
        page.evaluate("import('./js/state.js').then(m => m.game.money = 100000)") # Give plenty of money
        page.click(f".tab-btn[data-tab='farm']")
        time.sleep(0.2)
        plots_before = int(page.inner_text("#plot-count"))
        page.click("#shop-item-plot")
        time.sleep(0.2)
        plots_after = int(page.inner_text("#plot-count"))
        if plots_after > plots_before:
            print("PASS: Bought plot.")
        else:
            print("FAIL: Plot count did not increase.")

        # 4. Verify Buying Upgrade (Tech)
        print("Testing Buy Upgrade...")
        page.click(f".tab-btn[data-tab='tech']")
        time.sleep(0.2)
        # Check first upgrade: Outils Laser (upg-click)
        item = page.locator("#shop-item-upg-click")
        if item.is_visible():
            item.click()
            time.sleep(0.2)
            # Verify effect? Money per click should increase
            # Base click is 1. Upgrade adds +1 (effect) * mult?
            # Config: click: { name: "Outils Laser", desc: "+1 Crédit/Clic", base: 50, mult: 1.5, effect: 1 }
            # New click val should be higher.

            # Reset money to 0 to measure click
            page.evaluate("import('./js/state.js').then(m => m.game.money = 0)")
            page.click("#clicker-btn")
            time.sleep(0.1)
            money = int(page.inner_text("#money"))
            if money > 1: # Default is 1
                print(f"PASS: Upgrade worked. Click value: {money}")
            else:
                 print(f"FAIL: Upgrade seemingly didn't affect click value. Money: {money}")
        else:
            print("FAIL: Upgrade item not visible")

        # 5. Check for accumulated errors
        if len(errors) > 0:
            print("ERRORS FOUND:")
            for e in errors:
                print(e)
        else:
            print("No console errors.")

        browser.close()

if __name__ == "__main__":
    run()
