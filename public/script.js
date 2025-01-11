// public/script.js

const apiBaseUrl = "https://chiphidilai.vercel.app/api";
// const apiBaseUrl = "http://localhost:3000/api";

// Các biến trạng thái
let isEditingChild = false;
let currentChildId = null;

// Thêm hàm định dạng số tiền
function formatCurrency(input) {
  // Xóa tất cả ký tự không phải số
  let value = input.value.replace(/[^0-9]/g, '');
  
  // Định dạng số với dấu phẩy
  if (value) {
      value = parseInt(value, 10).toLocaleString('vi-VN');
  }
  
  // Cập nhật giá trị input
  input.value = value;
}

// DOM Elements
const elements = {
  parentTable: document.querySelector("#parentTable tbody"),
  childTable: document.querySelector("#childTable tbody"),
  childCards: document.getElementById("childCards"),
  parentDetails: document.getElementById("parentDetails"),
  addParentModal: document.getElementById("addParentModal"),
  addChildModal: document.getElementById("addChildModal"),
  childModal: document.getElementById("childModal"),
  parentForm: document.getElementById("parentForm"),
  childForm: document.getElementById("childForm"),
  addParentButton: document.getElementById("addParentButton"),
  addChildButton: document.getElementById("addChildButton"),
  closeButtons: document.querySelectorAll(".close")
};

// Modal actions
const modalActions = {
  open: (modal) => {
      if (!modal) return; // Kiểm tra modal tồn tại
      modal.classList.remove('hidden');
      requestAnimationFrame(() => {
          modal.classList.add('show');
      });
  },
  close: (modal) => {
      if (!modal) return; // Kiểm tra modal tồn tại
      modal.classList.remove('show');
      modal.addEventListener('transitionend', () => {
          modal.classList.add('hidden');
      }, { once: true });
  }
};

// Event Handlers
document.addEventListener('DOMContentLoaded', function() {
  // Xử lý nút thêm
  if (elements.addParentButton) {
      elements.addParentButton.addEventListener('click', () => {
          modalActions.open(elements.addParentModal);
      });
  }

  if (elements.addChildButton) {
      elements.addChildButton.addEventListener('click', () => {
          modalActions.open(elements.addChildModal);
      });
  }

  // Xử lý nút đóng
  elements.closeButtons.forEach(button => {
      button.addEventListener('click', function() {
          const modalId = this.getAttribute('data-modal');
          if (!modalId) return; // Kiểm tra modalId tồn tại
          
          const modal = document.getElementById(modalId);
          if (modal) { // Kiểm tra modal element tồn tại
              modalActions.close(modal);
          }
      });
  });

  // Đóng modal khi click bên ngoài
  window.addEventListener('click', function(event) {
      if (event.target.classList.contains('modal-fullscreen')) {
          modalActions.close(event.target);
      }
  });
});

// Debug helper
function checkElements() {
  console.log('Elements status:', {
      addParentButton: !!elements.addParentButton,
      addChildButton: !!elements.addChildButton,
      addParentModal: !!elements.addParentModal,
      addChildModal: !!elements.addChildModal,
      closeButtons: elements.closeButtons.length
  });
}

// Gọi hàm debug khi load
document.addEventListener('DOMContentLoaded', checkElements);

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


const fetchParentExpenses = async () => {
  try {
    const response = await fetch(`${apiBaseUrl}/parent-expenses`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const parents = await response.json();

    // Gán dữ liệu cho bảng, bao gồm nút chia sẻ
    parentTable.innerHTML = parents.map(parent => `
      <tr data-id="${parent._id}">
        <td>${new Date(parent.ngayBatDau).toLocaleDateString()}</td>
        <td>${parent.ngayKetThuc ? new Date(parent.ngayKetThuc).toLocaleDateString() : "Chưa kết thúc"}</td>
        <td>
          <!-- Nút chia sẻ -->
          <button class="share-btn" data-id="${parent._id}">
            <i class="bi bi-share"></i> Chia sẻ
          </button>
        </td>
      </tr>
    `).join("");
    // Gắn sự kiện click cho từng dòng bảng cha
    document.querySelectorAll("tr[data-id]").forEach(item => {
      item.addEventListener("click", () => showChildView(item.dataset.id));
    });

    // Gắn sự kiện click cho từng nút chia sẻ
    document.querySelectorAll(".share-btn").forEach(button => {
      button.addEventListener("click", (event) => {
        const id = event.target.closest("button").dataset.id; // Lấy ID của bảng cha
        const shareLink = `https://chiphidilai.vercel.app/view/${id}`;

        // Sao chép liên kết vào clipboard
        navigator.clipboard.writeText(shareLink).then(() => {
          showNotification(`Liên kết đã được sao chép: " + shareLink`, "success");
        }).catch((err) => {
          showNotification("Không thể sao chép liên kết.", "warning");
        });
      });
    });

  } catch (error) {
    showNotification("Lỗi khi tải danh sách bảng cha.", "warning");
  }
};


// Hàm để hiển thị chi tiết bảng con
const showChildView = async (parentId) => {
  try {
    // Hiển thị modal bảng con
    showLoading(); // Hiển thị loading khi bắt đầu xử lý
    openModal(childModal);

    // Lấy danh sách bảng con từ API đúng đường dẫn
    const childResponse = await fetch(`${apiBaseUrl}/child-expenses/parent/${parentId}`);
    if (!childResponse.ok) {
      throw new Error(`HTTP error! status: ${childResponse.status}`);
    }
    const children = await childResponse.json();

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
            <button class="edit-btn" data-id="${child._id}"><i class="bi bi-pencil-square"></i></button>
            <button class="delete-btn" data-id="${child._id}"><i class="bi bi-trash"></i></button>
          </div>
        </td>
      </tr>
    `).join("");

    // Tạo một thẻ hình ảnh duy nhất để sử dụng cho tất cả các hover
    const imagePreview = document.createElement("img");
    imagePreview.id = "imagePreview";
    imagePreview.style.position = "absolute";
    imagePreview.style.maxWidth = "600px";
    imagePreview.style.maxHeight = "600px";
    imagePreview.style.border = "1px solid #ddd";
    imagePreview.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.15)";
    imagePreview.style.display = "none";
    imagePreview.style.zIndex = "1000";
    imagePreview.style.opacity = "0";
    imagePreview.style.transition = "opacity 0.9s ease, transform 0.3s ease";
    imagePreview.style.transform = "scale(0.95)";
    imagePreview.style.borderRadius = "8px";
    document.body.appendChild(imagePreview);

    // Xử lý sự kiện hover
    const tableRows = childTable.querySelectorAll("tr");
    tableRows.forEach((row) => {
      const imageUrl = row.dataset.hinhAnh;
      const cells = row.querySelectorAll("td:not(:last-child)");
      
      cells.forEach(cell => {
        cell.addEventListener("mouseover", (event) => {
          if (imageUrl) {
            // Đặt src và hiển thị ảnh
            imagePreview.src = imageUrl.startsWith("http") ? imageUrl : `${window.location.origin}${imageUrl}`;
            imagePreview.alt = "Hình ảnh chi tiết";
            
            // Tính toán vị trí
            const rect = cell.getBoundingClientRect();
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
            
            let topPosition = rect.bottom + scrollTop + 10;
            let leftPosition = rect.left + scrollLeft;
            
            // Điều chỉnh vị trí nếu cần
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            
            if (topPosition + imagePreview.offsetHeight > viewportHeight + scrollTop) {
              topPosition = rect.top + scrollTop - imagePreview.offsetHeight - 10;
            }
            
            if (leftPosition + imagePreview.offsetWidth > viewportWidth + scrollLeft) {
              leftPosition = viewportWidth - imagePreview.offsetWidth - 10;
            }
            
            // Đặt vị trí và hiển thị ảnh với animation
            imagePreview.style.top = `${topPosition}px`;
            imagePreview.style.left = `${leftPosition}px`;
            imagePreview.style.display = "block";
            
            // Thêm timeout nhỏ để đảm bảo transition hoạt động
            setTimeout(() => {
              imagePreview.style.opacity = "1";
              imagePreview.style.transform = "scale(1)";
            }, 10);
          }
        });

        cell.addEventListener("mouseout", (event) => {
          const relatedTarget = event.relatedTarget;
          if (!row.contains(relatedTarget) || 
              (relatedTarget && relatedTarget.closest('td:last-child'))) {
            // Ẩn ảnh với animation
            imagePreview.style.opacity = "0";
            imagePreview.style.transform = "scale(0.95)";
            
            // Đợi animation hoàn thành rồi mới ẩn hoàn toàn

              imagePreview.style.display = "none";
          }
        });
      });
    });

    // Hiển thị dữ liệu bảng con trong card
    childCards.innerHTML = children.map(child => `
      <div class="card" data-id="${child._id}">
        <div class="card-header">
          <span class="date">${new Date(child.ngayThang).toLocaleDateString()}</span>
          <span class="location">${child.diaDiem || "Không có địa điểm"}</span>
        </div>
        <div class="card-content expandable">
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
            <button class="edit-btn" data-id="${child._id}"><i class="bi bi-pencil-square"></i></button>
            <button class="delete-btn" data-id="${child._id}"><i class="bi bi-trash"></i></button>
        </div>
      </div>
    `).join("");
    hideLoading();
    // Thêm cơ chế mở rộng chỉ khi nhấn vào nội dung
    document.querySelectorAll(".card-content.expandable").forEach((content) => {
      content.addEventListener("click", (e) => {
        // Ngăn chặn sự kiện nổi bọt
        e.stopPropagation();
        
        const card = content.closest('.card');
        const details = card.querySelector(".card-details");
        
        // Toggle hiệu ứng
        if (details.style.display === "block") {
          details.style.opacity = "0";
          details.style.transform = "translateY(-10px)";

            details.style.display = "none";
        } else {
          details.style.display = "block";
          // Đợi một chút để animation hoạt động
          setTimeout(() => {
            details.style.opacity = "1";
            details.style.transform = "translateY(0)";
          }, 10);
        }
      });
    });

  } catch (error) {
    showNotification("Lỗi khi tải dữ liệu bảng con hoặc bảng cha.", "warning");
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
      showNotification("Thêm bảng cha thành công!", "success");
      closeModalFunc(addParentModal);
      parentForm.reset();
      fetchParentExpenses();
    } else {
      const errorData = await response.json();
      showNotification("Lỗi khi thêm bảng cha!", "warning");
    }
  } catch (error) {
    console.error("Lỗi khi thêm bảng cha:", error);
    showNotification("Lỗi khi thêm bảng cha!", "warning");
  }
});

// Thêm sự kiện cho input giá tiền
document.getElementById('childPrice').addEventListener('input', function(e) {
  formatCurrency(this);
});


childForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    showLoading(); // Hiển thị loading khi bắt đầu xử lý

    // Lấy dữ liệu từ form
    const parentId = parentDetails.dataset.id;
    const ngayThang = document.getElementById("childDate").value.trim();
    const noiDung = document.getElementById("childContent").value.trim();
    const giaTienStr = document.getElementById("childPrice").value.replace(/[,\.]/g, '');
    const giaTien = parseInt(giaTienStr, 10);
    const diaDiem = document.getElementById("childLocation").value.trim();
    const ghiChu = document.getElementById("childNote").value.trim();
    const hinhAnhInput = document.getElementById("childImage").files[0];

    // Kiểm tra dữ liệu
    if (!parentId || !ngayThang || !noiDung || !giaTien || !diaDiem) {
      showNotification("Vui lòng điền đầy đủ thông tin!", "warning");
      hideLoading();
      return;
    }

    // Tạo payload cơ bản
    const payload = {
      ngayThang,
      noiDung,
      giaTien,
      diaDiem,
      ghiChu,
    };

    if (!isEditingChild) {
      payload.maChiPhi = parentId;
    }

    // Xử lý API request
    const url = isEditingChild && currentChildId 
      ? `${apiBaseUrl}/child-expenses/${currentChildId}`
      : `${apiBaseUrl}/child-expenses`;

    const response = await fetch(url, {
      method: isEditingChild ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error('Lỗi khi lưu dữ liệu');

    const data = await response.json();

    // Upload hình ảnh nếu có
    if (hinhAnhInput) {
      const compressedFile = await compressImage(hinhAnhInput);
      const formData = new FormData();
      formData.append("image", compressedFile);
      formData.append("childId", isEditingChild ? currentChildId : data._id);

      const uploadResponse = await fetch(`${apiBaseUrl}/upload-image`, {
        method: "POST",
        body: formData
      });

      if (!uploadResponse.ok) {
        showNotification("Lưu dữ liệu thành công, nhưng upload ảnh thất bại!", "warning");
      }
    }

    // Xử lý thành công
    showNotification(
      isEditingChild ? "Cập nhật thành công!" : "Thêm mới thành công!", 
      "success"
    );

    // Reset form và trạng thái
    closeModalFunc(addChildModal);
    showChildView(parentId);
    
    if (isEditingChild) {
      isEditingChild = false;
      currentChildId = null;
    } else {
      childForm.reset();
    }

  } catch (error) {
    console.error("Lỗi:", error);
    showNotification("Có lỗi xảy ra khi xử lý dữ liệu!", "error");
  } finally {
    hideLoading(); // Ẩn loading khi hoàn thành
  }
});

// Thêm hàm nén ảnh
async function compressImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = new Image();
      img.onload = function() {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Giới hạn kích thước tối đa
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          resolve(new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          }));
        }, 'image/jpeg', 0.7); // Nén với chất lượng 70%
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// Thêm CSS cho loading
const style = document.createElement('style');
style.textContent = `
  #loading {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  }

  .loading-spinner {
    background: white;
    padding: 20px 40px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .loading-spinner i {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    100% {
      transform: rotate(360deg);
    }
  }
`;
document.head.appendChild(style);

// Thêm hàm hiển thị/ẩn loading
function showLoading() {
  const loading = document.createElement('div');
  loading.id = 'loading';
  loading.innerHTML = `
    <div class="loading-spinner">
      <i class="bi bi-arrow-repeat"></i>
      <span>Đang xử lý...</span>
    </div>
  `;
  document.body.appendChild(loading);
}

function hideLoading() {
  const loading = document.getElementById('loading');
  if (loading) loading.remove();
}

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
      showNotification("Lỗi khi lấy dữ liệu chi phí con!", "warning");
    }
  }
});

// Tải danh sách bảng cha khi trang tải
document.addEventListener("DOMContentLoaded", fetchParentExpenses);



// Thêm event listener cho các nút trong bảng
document.addEventListener("click", async (event) => {
  const target = event.target;
  
  // Kiểm tra nếu click vào icon hoặc nút delete
  if (target.classList.contains("delete-btn") || 
      (target.parentElement && target.parentElement.classList.contains("delete-btn"))) {
    
    // Lấy button delete (có thể là target hoặc parent của icon)
    const deleteBtn = target.classList.contains("delete-btn") ? target : target.parentElement;
    const childId = deleteBtn.dataset.id;
    
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
          showNotification("Xoá thành công!", "success");
          // Refresh lại danh sách sau khi xóa
          showChildView(parentDetails.dataset.id);
        } else if (response.status === 404) {
          showNotification("Không tìm thấy dữ liệu để xoá!", "error");
        } else {
          showNotification("Lỗi khi xoá dữ liệu!", "error");
        }
      } catch (error) {
        showNotification("Lỗi khi xoá chi phí con!", "error");
      }
    }
  }
});

// Hàm hiển thị thông báo
function showNotification(message, type = 'info', duration = 3000) {
  const container = document.getElementById('notification-container');
  
  // Tạo thông báo mới
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  
  // Thêm icon tương ứng với loại thông báo
  let icon = '';
  switch(type) {
      case 'success':
          icon = '<i class="bi bi-check-circle"></i>';
          break;
      case 'error':
          icon = '<i class="bi bi-x-circle"></i>';
          break;
      case 'warning':
          icon = '<i class="bi bi-exclamation-triangle"></i>';
          break;
      default:
          icon = '<i class="bi bi-info-circle"></i>';
  }
  
  notification.innerHTML = `${icon} ${message}`;
  
  // Thêm vào container
  container.appendChild(notification);
  
  // Hiển thị với animation
  setTimeout(() => {
      notification.classList.add('show');
  }, 10);
  
  // Tự động ẩn sau duration
  setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
          container.removeChild(notification);
      }, 300);
  }, duration);
}



// Hàm mã hóa đơn giản
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
  }
  return hash.toString(36); // Chuyển về base36 để ngắn gọn
}

// Thông tin đăng nhập đã hash
const SECURE_CREDENTIALS = {
  username: "nhocac",
  passwordHash: simpleHash("mges@@@110994") // Hash được tạo từ password gốc
};

// Xử lý đăng nhập
document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('loginForm');
  const loginModal = document.getElementById('loginModal');
  const mainContent = document.getElementById('mainContent');
  const loginError = document.getElementById('loginError');

  if (!loginForm || !loginModal || !mainContent || !loginError) {
      console.error('Không tìm thấy các elements cần thiết');
      return;
  }

  // Kiểm tra đăng nhập
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const loginExpiry = localStorage.getItem('loginExpiry');
  const now = new Date().getTime();

  if (isLoggedIn && loginExpiry && now < parseInt(loginExpiry)) {
      loginModal.style.display = 'none';
      mainContent.style.display = 'block';
  } else {
      localStorage.clear(); // Xóa hết data cũ
      loginModal.style.display = 'flex';
      mainContent.style.display = 'none';
  }

  // Xử lý form đăng nhập
  loginForm.addEventListener('submit', function(e) {
      e.preventDefault();

      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value.trim();
      const hashedPassword = simpleHash(password);

      if (username === SECURE_CREDENTIALS.username && 
          hashedPassword === SECURE_CREDENTIALS.passwordHash) {
          
          // Lưu trạng thái đăng nhập (24 giờ)
          const expiry = new Date().getTime() + (24 * 60 * 60 * 1000);
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('loginExpiry', expiry.toString());

          // Hiển thị nội dung
          loginModal.style.display = 'none';
          mainContent.style.display = 'block';

          // Thông báo
          if (typeof showNotification === 'function') {
              showNotification("Đăng nhập thành công!", "success");
          }

          // Clear form
          loginForm.reset();
      } else {
          loginError.style.display = 'block';
          if (typeof showNotification === 'function') {
              showNotification("Sai thông tin đăng nhập!", "error");
          }
      }
  });

  // Kiểm tra session hết hạn mỗi phút
  setInterval(() => {
      const expiry = localStorage.getItem('loginExpiry');
      if (expiry && new Date().getTime() > parseInt(expiry)) {
          localStorage.clear();
          location.reload();
      }
  }, 60000);


  // Thêm nút đăng xuất nếu cần
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
      logoutBtn.addEventListener('click', function() {
          localStorage.removeItem('isLoggedIn');
          loginModal.style.display = 'flex';
          mainContent.style.display = 'none';
          loginForm.reset();
          loginError.style.display = 'none';
          
          if (typeof showNotification === 'function') {
              showNotification("Đã đăng xuất!", "info");
          }
      });
  }
});
