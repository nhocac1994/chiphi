document.addEventListener("DOMContentLoaded", () => {
    const imagePreview = document.getElementById("imagePreview");
    const childTable = document.getElementById("childTable");
  
    if (childTable) {
      const tableRows = childTable.querySelectorAll("tbody tr");
      tableRows.forEach((row) => {
        const imageUrl = row.dataset.hinhAnh;
        console.log("Hình ảnh URL:", imageUrl);
  
        row.addEventListener("mouseover", (event) => {
          if (imageUrl) {
            // Đặt nguồn hình ảnh
            imagePreview.src = imageUrl.startsWith("http") ? imageUrl : `${window.location.origin}${imageUrl}`;
            imagePreview.alt = "Hình ảnh chi tiết";
  
            // Tính toán vị trí của hàng để đặt hình ảnh phía dưới
            const rect = row.getBoundingClientRect();
            const scrollTop = window.scrollY || window.pageYOffset;
            const scrollLeft = window.scrollX || window.pageXOffset;
  
            // Kích thước hình ảnh
            const imageWidth = 600; // maxWidth
            const imageHeight = 600; // maxHeight
  
            // Kích thước cửa sổ trình duyệt
            const viewportWidth = window.innerWidth;
  
            // Tính toán vị trí đặt hình ảnh bên dưới hàng, cách 10px
            let topPosition = rect.bottom + scrollTop + 10;
            let leftPosition = rect.left + scrollLeft;
  
            // Kiểm tra nếu hình ảnh vượt ra ngoài phía phải màn hình
            if (leftPosition + imageWidth > scrollLeft + viewportWidth) {
              leftPosition = scrollLeft + viewportWidth - imageWidth - 10; // Căn chỉnh bên phải nếu vượt ra ngoài
            }
  
            // Đặt vị trí của hình ảnh
            imagePreview.style.top = `${topPosition}px`;
            imagePreview.style.left = `${leftPosition}px`;
            imagePreview.style.display = "block"; // Hiển thị hình ảnh
            imagePreview.classList.add("show");
          }
        });
  
        row.addEventListener("mouseout", () => {
          // Ẩn hình ảnh khi không hover
          imagePreview.style.display = "none";
          imagePreview.classList.remove("show");
        });
      });
    }
  });
  