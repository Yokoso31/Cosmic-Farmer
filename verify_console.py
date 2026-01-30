from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        errors = []
        page.on("pageerror", lambda err: errors.append(err.message))
        page.on("console", lambda msg: errors.append(msg.text) if msg.type == "error" else None)

        page.goto("http://localhost:8000/index.html")
        page.wait_for_selector("#clicker-btn")

        # Give money
        page.evaluate("import('./js/state.js').then(m => m.game.money = 1000)")

        # Click tabs to ensure no errors
        tabs = page.locator(".tab-btn").all()
        for tab in tabs:
            tab.click()
            time.sleep(0.1)

        # Click main button
        page.click("#clicker-btn")

        # Check errors
        if len(errors) > 0:
            print("ERRORS FOUND:")
            for e in errors:
                print(e)
        else:
            print("No console errors found.")

        browser.close()

if __name__ == "__main__":
    run()
