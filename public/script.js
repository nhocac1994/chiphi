// public/script.js

// const apiBaseUrl = "https://chiphidilai.vercel.app/api";
const apiBaseUrl = "http://localhost:3000/api";

// Các biến trạng thái
let isEditingChild = false;
let currentChildId = null;

// DOM Elements
const parentTable = document.querySelector("#parentTable tbody");
const childTable = document.querySelector("#childTable tbody");
const childCards = document.getElementById("childCards");
const parentDetails = document.getElementById("parentDetails");
const addParentModal = document.getElementById("addParentModal");
const addChildModal = document.getElementById("addChildModal");
const childModal = document.getElementById("childModal");
const parentForm = document.getElementById("parentForm");
const childForm = document.getElementById("childForm");
const addParentButton = document.getElementById("addParentButton");
const addChildButton = document.getElementById("addChildButton");
const closeButtons = document.querySelectorAll(".close"); // Tất cả nút đóng modal

// Hàm để mở modal
const openModal = (modal) => {
  modal.classList.remove("hidden");
};

// Hàm để đóng modal
const closeModalFunc = (modal) => {
  modal.classList.add("hidden");
};

// Gán sự kiện cho các nút mở modal
addParentButton.addEventListener("click", () => openModal(addParentModal));
addChildButton.addEventListener("click", () => openModal(addChildModal));

// Gán sự kiện cho các nút đóng modal
closeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const modal = button.closest(".modal, .modal-fullscreen");
    if (modal) closeModalFunc(modal);
  });
});

// Gán sự kiện đóng modal khi nhấp ra ngoài nội dung modal
window.addEventListener("click", (event) => {
  [addParentModal, addChildModal, childModal].forEach((modal) => {
    if (event.target === modal) closeModalFunc(modal);
  });
});

// Fetch và hiển thị danh sách bảng cha
const fetchParentExpenses = async () => {
  try {
    const response = await fetch(`${apiBaseUrl}/parent-expenses`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const parents = await response.json();

    // Chỉ gán dữ liệu cho bảng
    parentTable.innerHTML = parents.map(parent => `
      <tr data-id="${parent._id}">
        <td>${new Date(parent.ngayBatDau).toLocaleDateString()}</td>
        <td>${parent.ngayKetThuc ? new Date(parent.ngayKetThuc).toLocaleDateString() : "Chưa kết thúc"}</td>
      </tr>
    `).join("");

    // Gắn sự kiện click cho từng dòng bảng cha
    document.querySelectorAll("tr[data-id]").forEach(item => {
      item.addEventListener("click", () => showChildView(item.dataset.id));
    });
  } catch (error) {
    console.error("Lỗi khi tải danh sách bảng cha:", error);
    alert("Lỗi khi tải danh sách bảng cha.");
  }
};


// Hàm để hiển thị chi tiết bảng con
const showChildView = async (parentId) => {
  try {
    console.log("Hiển thị bảng con cho Parent ID:", parentId);
    // Hiển thị modal bảng con
    openModal(childModal);

    // Lấy danh sách bảng con từ API đúng đường dẫn
    const childResponse = await fetch(`${apiBaseUrl}/child-expenses/parent/${parentId}`);
    if (!childResponse.ok) {
      throw new Error(`HTTP error! status: ${childResponse.status}`);
    }
    const children = await childResponse.json();
    console.log("Dữ liệu chi phí con:", children);

    // Lấy thông tin bảng cha từ API
    const parentResponse = await fetch(`${apiBaseUrl}/parent-expenses/${parentId}`);
    if (!parentResponse.ok) {
      throw new Error(`HTTP error! status: ${parentResponse.status}`);
    }
    const parent = await parentResponse.json();
    parentDetails.dataset.id = parentId;
    parentDetails.innerHTML = `
      <p><strong>Ngày bắt đầu:</strong> ${new Date(parent.ngayBatDau).toLocaleDateString()}</p>
      <p><strong>Ngày kết thúc:</strong> ${parent.ngayKetThuc ? new Date(parent.ngayKetThuc).toLocaleDateString() : "Chưa kết thúc"}</p>
    `;

    // Kiểm tra xem children có phải là mảng không
    if (!Array.isArray(children)) {
      console.error("Dữ liệu bảng con không phải là mảng:", children);
      childTable.innerHTML = `<tr><td colspan="7">Không có dữ liệu bảng con.</td></tr>`;
      childCards.innerHTML = `<p>Không có dữ liệu bảng con.</p>`;
      return;
    }

    // Hiển thị bảng con trong bảng
    childTable.innerHTML = children.map((child, index) => `
      <tr data-index="${index}" data-hinh-anh="${child.hinhAnh || ''}">
        <td>${new Date(child.ngayThang).toLocaleDateString()}</td>
        <td>${child.noiDung}</td>
        <td>${child.giaTien.toLocaleString()} VND</td>
        <td>${child.diaDiem}</td>
        <td>${child.ghiChu || "Không có"}</td>
        <td>
          <div class="card-actions">
            <button class="edit-btn" data-id="${child._id}">Sửa</button>
            <button class="delete-btn" data-id="${child._id}">Xóa</button>
          </div>
        </td>
      </tr>
    `).join("");

// Tạo một thẻ hình ảnh duy nhất để sử dụng cho tất cả các hover
const imagePreview = document.createElement("img");
imagePreview.id = "imagePreview"; // Gắn ID để dễ dàng quản lý
imagePreview.style.position = "absolute";
imagePreview.style.maxWidth = "600px";
imagePreview.style.maxHeight = "600px";
imagePreview.style.border = "1px solid #ddd";
imagePreview.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
imagePreview.style.display = "none"; // Ẩn thẻ hình ảnh ban đầu
imagePreview.style.zIndex = "1000"; // Đảm bảo hình ảnh nằm trên cùng
document.body.appendChild(imagePreview);

// Xử lý sự kiện hover để hiển thị hình ảnh bên trái
const tableRows = childTable.querySelectorAll("tr");
tableRows.forEach((row) => {
  const imageUrl = row.dataset.hinhAnh;
  console.log("Hình ảnh URL:", imageUrl);

  row.addEventListener("mouseover", (event) => {
    if (imageUrl) {
      // Đảm bảo rằng đường dẫn hình ảnh là URL hoàn chỉnh
      imagePreview.src = imageUrl.startsWith("http") ? imageUrl : `${window.location.origin}${imageUrl}`;
      imagePreview.alt = "Hình ảnh chi tiết";

      // Tính toán vị trí của hàng để đặt hình ảnh
      const rect = row.getBoundingClientRect();
      const scrollTop = window.scrollY || window.pageYOffset;
      const scrollLeft = window.scrollX || window.pageXOffset;

      // Kích thước hình ảnh
      const imageWidth = 600; // maxWidth
      const imageHeight = 600; // maxHeight

      // Kích thước cửa sổ trình duyệt
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Tính toán vị trí ban đầu: bên trái hàng, cách 10px
      let topPosition = rect.top + scrollTop + 50;
      let leftPosition = rect.left + scrollLeft - imageWidth - 10;

      // Kiểm tra nếu hình ảnh vượt ra ngoài phía trái màn hình
      if (leftPosition < scrollLeft) {
        leftPosition = rect.left + scrollLeft + 10; // Đặt bên phải hàng nếu không đủ chỗ bên trái
      }

      // Kiểm tra nếu hình ảnh vượt ra ngoài phía dưới màn hình
      if (topPosition + imageHeight > scrollTop + viewportHeight) {
        topPosition = rect.top + scrollTop - imageHeight - 10; // Đặt phía trên hàng
      }

      // Đặt vị trí của hình ảnh
      imagePreview.style.top = `${topPosition}px`;
      imagePreview.style.left = `${leftPosition}px`;
      imagePreview.style.display = "block"; // Hiển thị hình ảnh
    }
  });

  row.addEventListener("mouseout", () => {
    // Ẩn hình ảnh khi không hover
    imagePreview.style.display = "none";
  });
});




    // Hiển thị dữ liệu bảng con trong card (bao gồm hình ảnh)
    childCards.innerHTML = children.map(child => `
      <div class="card" data-id="${child._id}">
        <div class="card-header">
          <span class="date">${new Date(child.ngayThang).toLocaleDateString()}</span>
          <span class="location">${child.diaDiem || "Không có địa điểm"}</span>
        </div>
        <div class="card-content">
          <span class="content">${child.noiDung}</span>
          <span class="price">${child.giaTien.toLocaleString()} VND</span>
        </div>
        <div class="card-details" style="display: none;">
          <p class="note"><strong>Ghi chú:</strong> ${child.ghiChu || "Không có"}</p>
          ${
            child.hinhAnh
              ? `<img src="${child.hinhAnh.startsWith("http") ? child.hinhAnh : `${window.location.origin}${child.hinhAnh}`}" alt="Hình ảnh">`
              : "<p>Không có hình ảnh</p>"
          }
        </div>
        <div class="card-actions">
          <button class="edit-btn" data-id="${child._id}">Sửa</button>
          <button class="delete-btn" data-id="${child._id}">Xóa</button>
        </div>
      </div>
    `).join("");

    // Thêm cơ chế mở rộng khi nhấn vào card
    document.querySelectorAll(".card").forEach((card) => {
      card.addEventListener("click", (e) => {
        // Ngăn chặn sự kiện click từ các nút bên trong card
        if (e.target.tagName.toLowerCase() === 'button') return;

        const details = card.querySelector(".card-details");
        if (details.style.display === "block") {
          details.style.display = "none"; // Thu nhỏ lại nếu đã mở
        } else {
          details.style.display = "block"; // Mở rộng card
        }
      });
    });

  } catch (error) {
    console.error("Lỗi khi tải bảng con hoặc bảng cha:", error);
    alert("Lỗi khi tải dữ liệu bảng con hoặc bảng cha.");
    // Hiển thị thông báo lỗi trên UI nếu cần
    childTable.innerHTML = `<tr><td colspan="7">Lỗi khi tải dữ liệu bảng con.</td></tr>`;
    childCards.innerHTML = `<p>Lỗi khi tải dữ liệu bảng con.</p>`;
  }
};

// Xử lý form thêm bảng cha
parentForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const ngayBatDau = document.getElementById("parentStartDate").value;

  try {
    const response = await fetch(`${apiBaseUrl}/parent-expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ngayBatDau }),
    });

    if (response.ok) {
      alert("Thêm bảng cha thành công!");
      closeModalFunc(addParentModal);
      parentForm.reset();
      fetchParentExpenses();
    } else {
      const errorData = await response.json();
      alert(`Lỗi khi thêm bảng cha: ${errorData.message || "Unknown error."}`);
    }
  } catch (error) {
    console.error("Lỗi khi thêm bảng cha:", error);
    alert("Lỗi khi thêm bảng cha.");
  }
});

// Event listener cho form thêm/cập nhật chi phí con
// childForm.addEventListener("submit", async (e) => {
//   e.preventDefault();

//   // Lấy dữ liệu từ form
//   const parentId = parentDetails.dataset.id;
//   const ngayThang = document.getElementById("childDate").value.trim();
//   const noiDung = document.getElementById("childContent").value.trim();
//   const giaTienValue = document.getElementById("childPrice").value.trim();
//   const giaTien = giaTienValue ? parseFloat(giaTienValue) : null;
//   const diaDiem = document.getElementById("childLocation").value.trim();
//   const ghiChu = document.getElementById("childNote").value.trim();
//   const hinhAnhInput = document.getElementById("childImage").files[0];

//   // Log dữ liệu trước khi gửi
//   console.log("Dữ liệu gửi lên:", { parentId, ngayThang, noiDung, giaTien, diaDiem, ghiChu });

//   // Kiểm tra dữ liệu bắt buộc
//   if (!parentId || !ngayThang || !noiDung || giaTien == null || !diaDiem) {
//     alert("Vui lòng điền đầy đủ thông tin chi phí.");
//     return;
//   }

//   if (isNaN(giaTien) || giaTien <= 0) {
//     alert("Vui lòng nhập một giá tiền hợp lệ.");
//     return;
//   }

//   // Đối tượng dữ liệu để gửi
//   const payload = {
//     ngayThang,
//     noiDung,
//     giaTien,
//     diaDiem,
//     ghiChu,
//   };

//   // Nếu đang trong chế độ chỉnh sửa, không thêm maChiPhi
//   if (!isEditingChild) {
//     payload.maChiPhi = parentId;
//   }

//   // Log payload để kiểm tra
//   console.log("Payload gửi lên:", payload);

//   try {
//     let response;
//     let data;

//     if (isEditingChild && currentChildId) {
//       // Cập nhật chi phí con
//       response = await fetch(`${apiBaseUrl}/child-expenses/${currentChildId}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       if (response.ok) {
//         data = await response.json();
//         alert("Cập nhật thành công!");
//       } else {
//         const errorData = await response.json();
//         alert(`Lỗi khi cập nhật: ${errorData.message || "Unknown error."}`);
//         return;
//       }
//     } else {
//       // Thêm mới chi phí con
//       response = await fetch(`${apiBaseUrl}/child-expenses`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       if (response.ok) {
//         data = await response.json();
//         alert("Thêm mới thành công!");
//       } else {
//         const errorData = await response.json();
//         alert(`Lỗi khi thêm mới: ${errorData.message || "Unknown error."}`);
//         return;
//       }
//     }

//     // Đóng modal và cập nhật giao diện
//     closeModalFunc(addChildModal);
//     showChildView(parentId);

//     // Nếu có ảnh, xử lý tiếp
//     if (hinhAnhInput) {
//       const formData = new FormData();
//       formData.append("image", hinhAnhInput);
//       formData.append("childId", isEditingChild && currentChildId ? currentChildId : data._id);

//       try {
//         const uploadResponse = await fetch(`${apiBaseUrl}/upload-image`, {
//           method: "POST",
//           body: formData,
//         });

//         if (uploadResponse.ok) {
//           const uploadData = await uploadResponse.json();
//           alert("Hình ảnh đã được tải lên thành công!");
//           // Tải lại giao diện để hiển thị hình ảnh
//           showChildView(parentId);
//         } else {
//           const uploadErrorData = await uploadResponse.json();
//           alert(`Lỗi khi tải hình ảnh: ${uploadErrorData.message || "Unknown error."}`);
//         }
//       } catch (error) {
//         console.error("Lỗi khi tải hình ảnh:", error);
//         alert("Lỗi khi xử lý hình ảnh.");
//       }
//     }

//     // Reset trạng thái sau khi cập nhật
//     if (isEditingChild) {
//       isEditingChild = false;
//       currentChildId = null;
//     }

//     // Reset form sau khi thêm mới
//     if (!isEditingChild) {
//       childForm.reset();
//     }
//   } catch (error) {
//     console.error("Lỗi khi xử lý dữ liệu:", error);
//     alert("Lỗi khi xử lý dữ liệu.");
//   }
// });

// Event listener cho form thêm/cập nhật chi phí con
childForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Lấy dữ liệu từ form
  const parentId = parentDetails.dataset.id;
  const ngayThang = document.getElementById("childDate").value.trim();
  const noiDung = document.getElementById("childContent").value.trim();
  const giaTienValue = document.getElementById("childPrice").value.trim();
  const giaTien = giaTienValue ? parseFloat(giaTienValue) : null;
  const diaDiem = document.getElementById("childLocation").value.trim();
  const ghiChu = document.getElementById("childNote").value.trim();
  const hinhAnhInput = document.getElementById("childImage").files[0];

  // Log dữ liệu trước khi gửi
  console.log("Dữ liệu gửi lên:", { parentId, ngayThang, noiDung, giaTien, diaDiem, ghiChu });

  // Kiểm tra dữ liệu bắt buộc
  if (!parentId || !ngayThang || !noiDung || giaTien == null || !diaDiem) {
    alert("Vui lòng điền đầy đủ thông tin chi phí.");
    return;
  }

  if (isNaN(giaTien) || giaTien <= 0) {
    alert("Vui lòng nhập một giá tiền hợp lệ.");
    return;
  }

  // Đối tượng dữ liệu để gửi
  const payload = {
    ngayThang,
    noiDung,
    giaTien,
    diaDiem,
    ghiChu,
  };

  // Nếu đang trong chế độ chỉnh sửa, không thêm maChiPhi
  if (!isEditingChild) {
    payload.maChiPhi = parentId;
  }

  // Log payload để kiểm tra
  console.log("Payload gửi lên:", payload);

  try {
    let response;
    let data;

    if (isEditingChild && currentChildId) {
      // Cập nhật chi phí con
      response = await fetch(`${apiBaseUrl}/child-expenses/${currentChildId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        data = await response.json();
        alert("Cập nhật thành công!");
      } else {
        const errorData = await response.json();
        alert(`Lỗi khi cập nhật: ${errorData.message || "Unknown error."}`);
        return;
      }
    } else {
      // Thêm mới chi phí con
      response = await fetch(`${apiBaseUrl}/child-expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        data = await response.json();
        alert("Thêm mới thành công!");
      } else {
        const errorData = await response.json();
        alert(`Lỗi khi thêm mới: ${errorData.message || "Unknown error."}`);
        return;
      }
    }

    // Đóng modal và cập nhật giao diện
    closeModalFunc(addChildModal);
    showChildView(parentId);

    // Nếu có ảnh, xử lý tiếp
    if (hinhAnhInput) {
      const formData = new FormData();
      formData.append("image", hinhAnhInput); // Tệp hình ảnh
      formData.append("childId", isEditingChild && currentChildId ? currentChildId : data._id); // ID của chi phí con

      try {
        const uploadResponse = await fetch(`${apiBaseUrl}/upload-image`, {
          method: "POST",
          body: formData, // Gửi dữ liệu FormData
        });
      
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          alert("Hình ảnh đã được tải lên thành công!");
          console.log("Hình ảnh đã tải lên:", uploadData.hinhAnh);
      
          // Tải lại giao diện để hiển thị hình ảnh đã cập nhật
          showChildView(parentId);
        } else {
          const uploadErrorData = await uploadResponse.json();
          alert(`Lỗi khi tải hình ảnh: ${uploadErrorData.message || "Unknown error."}`);
        }
      } catch (error) {
        console.error("Lỗi khi tải hình ảnh:", error);
        alert("Lỗi khi xử lý hình ảnh.");
      }
      
    }


    // Reset trạng thái sau khi cập nhật
    if (isEditingChild) {
      isEditingChild = false;
      currentChildId = null;
    }

    // Reset form sau khi thêm mới
    if (!isEditingChild) {
      childForm.reset();
    }
  } catch (error) {
    console.error("Lỗi khi xử lý dữ liệu:", error);
    alert("Lỗi khi xử lý dữ liệu.");
  }
});

// Khi nhấn nút sửa, thiết lập trạng thái sửa
document.addEventListener("click", async (event) => {
  if (event.target.classList.contains("edit-btn")) {
    const childId = event.target.dataset.id;
    console.log("Nhấn nút Sửa cho chi phí con ID:", childId);
    if (!childId) {
      console.error("Không tìm thấy ID để sửa.");
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/child-expenses/${childId}`);
      if (!response.ok) {
        throw new Error("Không tìm thấy dữ liệu.");
      }

      const child = await response.json();
      console.log("Dữ liệu trả về từ API:", child);
      if (!child) {
        console.error("Dữ liệu trả về từ API không hợp lệ:", child);
        return;
      }

      // Thiết lập trạng thái sửa
      isEditingChild = true;
      currentChildId = childId;

      // Điền dữ liệu vào form
      document.getElementById("childDate").value = child.ngayThang ? child.ngayThang.split("T")[0] : "";
      document.getElementById("childContent").value = child.noiDung || "";
      document.getElementById("childPrice").value = child.giaTien || "";
      document.getElementById("childLocation").value = child.diaDiem || "";
      document.getElementById("childNote").value = child.ghiChu || "";

      // Mở modal sửa
      openModal(addChildModal);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error.message);
      alert("Lỗi khi lấy dữ liệu chi phí con.");
    }
  }

  // Khi nhấn nút xoá, xử lý xoá chi phí con
  if (event.target.classList.contains("delete-btn")) {
    const childId = event.target.dataset.id;
    console.log("Nhấn nút Xóa cho chi phí con ID:", childId);
    if (!childId) {
      console.error("Không tìm thấy ID để xoá.");
      return;
    }

    if (confirm("Bạn có chắc chắn muốn xoá không?")) {
      try {
        const response = await fetch(`${apiBaseUrl}/child-expenses/${childId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          alert("Xoá thành công!");
          showChildView(parentDetails.dataset.id);
        } else if (response.status === 404) {
          alert("Không tìm thấy dữ liệu để xoá.");
        } else {
          const errorData = await response.json();
          alert(`Lỗi khi xoá dữ liệu: ${errorData.message || "Unknown error."}`);
        }
      } catch (error) {
        console.error("Lỗi khi xoá:", error);
        alert("Lỗi khi xoá chi phí con.");
      }
    }
  }
});

// Tải danh sách bảng cha khi trang tải
document.addEventListener("DOMContentLoaded", fetchParentExpenses);
