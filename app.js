const portfolioGrid = document.getElementById("portfolioGrid");

async function loadPortfolio() {
  try {
    const response = await fetch("content.json");
    const data = await response.json();

    const projects = data.projects || [];

    if (!projects.length) {
      portfolioGrid.innerHTML = `
        <article class="project-card">
          <div class="project-body">
            <h3>Chưa có dự án nào</h3>
            <p>Vui lòng cập nhật dữ liệu hoặc CMS để hiển thị portfolio.</p>
          </div>
        </article>
      `;
      return;
    }

    portfolioGrid.innerHTML = projects.map(project => `
      <article class="project-card">
        <img src="${project.image}" alt="${project.title}" />
        <div class="project-body">
          <h3>${project.title}</h3>
          <p>${project.description}</p>
        </div>
      </article>
    `).join("");
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu:", error);
    portfolioGrid.innerHTML = `
      <article class="project-card">
        <div class="project-body">
          <h3>Không thể tải dữ liệu</h3>
          <p>Vui lòng kiểm tra file content.json hoặc API từ CMS.</p>
        </div>
      </article>
    `;
  }
}

loadPortfolio();