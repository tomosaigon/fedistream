# Shadowbox

### Description
Shadowbox is an alternative timeline client for Mastodon, acting as a community timeline aggregator. It's the missing bootstrapping and discovery function for Mastodon, with an emphasis on client-based moderation over server and community moderation.

- **Who is it for?** People who want to social network around topics that are popular on Mastodon, such as software, Linux, and coding, and who might want to ignore US political discussions.
- **Why it's awesome:** Faster, more efficient, and provides a cleaner experience with less noise.

- [Installation](#installation)
- [Usage](#usage)
- [License](#license)
- [Contact](#contact)

### Installation
To get started with Shadowbox, follow these steps:

#### Local Installation
1. **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/shadowbox.git
    cd shadowbox
    ```

2. **Install dependencies:**
    ```bash
    npm install
    ```

3. **Run the development server:**
    ```bash
    npm run dev
    ```

#### Docker Installation (Recommended)
1. **Build the Docker image:**
    ```bash
    docker build -t shadowbox .
    ```

    This will install the required dependencies.

2. **Run the Docker container:**
    ```bash
    docker run -p 3000:3000 shadowbox
    ```

### Usage
To use Shadowbox, follow these steps:

1. **Open your browser:**
    Navigate to `http://localhost:3000`.

2. **Homepage:**
    You will be presented with the homepage that already has many open-source related Mastodon instances populated and ready to start collecting posts.

3. **Collect Posts:**
    Click on the "Collect Posts" button for each instance. This action will update a graph showing how the posts have been categorized and how many regular posts are available to read.

4. **View Regular Posts:**
    Click on the "Regular" link to view a timeline of regular posts on that instance.

### License
This project is licensed under the terms of the [GNU General Public License (GPL)](https://www.gnu.org/licenses/gpl-3.0.en.html).

### Contact
For any questions or feedback, reach out to me on Mastodon at **@tomosaigon@fosstodon.org**.
