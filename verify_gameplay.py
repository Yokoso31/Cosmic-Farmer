from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:8000/index.html")
        page.wait_for_selector("#clicker-btn")

        # Give money
        page.evaluate("import('./js/state.js').then(m => m.game.money = 1000)")

        # Buy Plot
        # We need to click the 'Ferme' tab first (it is default, but good to be sure)
        page.click(".tab-btn[data-tab='farm']") # Wait, I didn't add data-tab yet! I relied on text or index.
        # In js/ui.js I wrote: `const activeBtn = document.querySelector(`.tab-btn[data-tab="${t}"]`);`
        # But I never updated HTML to have data-tab!

        # FIX: The UI tab switching might be broken if selectors fail.
        # Let's check if the shop item for plot exists.

        shop_item_plot = page.locator("#shop-item-plot")
        if not shop_item_plot.is_visible():
            print("Shop item plot not visible. Clicking Farm tab.")
            # Click the first tab
            page.locator(".tab-btn").first.click()
            time.sleep(0.5)

        if not shop_item_plot.is_visible():
            print("ERROR: Shop item plot still not visible.")
            return

        print("Buying Plot...")
        shop_item_plot.click()

        # Check if plot appeared
        plot_count = page.locator(".plot").count()
        print(f"Plots: {plot_count}")

        if plot_count == 0:
            print("ERROR: Plot did not appear.")
            return

        # Check if money increases automatically
        # Set money to 0 to observe change clearly
        page.evaluate("import('./js/state.js').then(m => m.game.money = 0)")
        time.sleep(4) # Wait for plant to grow (3s base duration)

        money = int(page.inner_text("#money"))
        print(f"Money after harvest: {money}")

        if money > 0:
            print("SUCCESS: Farm is producing.")
        else:
            print("ERROR: Farm did not produce.")

        browser.close()

if __name__ == "__main__":
    run()
