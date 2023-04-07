const firebaseConfig = {
    apiKey: "AIzaSyDv1l_dlz88GLmtb7GpSBkk-HoisTcIvT4",
    authDomain: "educatehacks-447af.firebaseapp.com",
    databaseURL: "https://educatehacks-447af-default-rtdb.firebaseio.com",
    projectId: "educatehacks-447af",
    storageBucket: "educatehacks-447af.appspot.com",
    messagingSenderId: "601188330660",
    appId: "1:601188330660:web:d18317cb8376e56f1a4a31",
    measurementId: "G-52EPNCNE2Q"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();


function generate_code() {

    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var result = ''
    for (i = 0; i < 6; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result

}

const pages = {

    active_page: function (page_name, student_code, room_code) {
        this[page_name](student_code, room_code)
        var page = document.getElementById(page_name)
        page.style.display = "grid"
        this.page_arr.forEach(e => {
            if (e != page_name) {
                document.getElementById(e).style.display = "none"
            }
        })

    },

    page_arr: new Array(),

    create_page_div: function (page_name) {
        const page_div = document.createElement("div")
        page_div.id = page_name
        page_div.classList = "center"
        page_div.style.display = "none"
        this.page_arr.push(page_name)
        document.body.appendChild(page_div)

    },

    start_page: function () {

        this.create_page_div("start_page")
        const page_div = document.getElementById("start_page")

        const title = document.createElement("h1")
        title.innerHTML = "Note-Taking Tracker"
        page_div.appendChild(title)

        const enter_btn = document.createElement("button")
        enter_btn.innerHTML = "Enter a code"
        enter_btn.classList = "celestial"
        enter_btn.onclick = function () { pages.active_page("enter_page") }
        page_div.appendChild(enter_btn)

        const create_btn = document.createElement("button")
        create_btn.innerHTML = "Create a code"
        create_btn.classList = "emerald"
        create_btn.onclick = function () { pages.active_page("teacher_page") }
        page_div.appendChild(create_btn)

    },

    enter_page: function () {

        this.create_page_div("enter_page")
        const page_div = document.getElementById("enter_page")

        const code_input = document.createElement("input")
        code_input.placeholder = "Enter a code"
        page_div.appendChild(code_input)

        const enter_btn = document.createElement("button")
        page_div.appendChild(enter_btn)
        enter_btn.innerHTML = "Enter"
        enter_btn.classList = "celestial"

        const code_err = document.createElement("p")
        code_err.innerHTML = "⚠ Code does not correspond to any existing room"
        code_err.style.cssText = "color: #FE615C; font-size: 12px; visibility: hidden"
        page_div.appendChild(code_err)

        enter_btn.onclick = function () {
            var entry_code = code_input.value
            if (entry_code !== "") {
                database.ref().child(entry_code).get().then((result) => {
                    if (result.exists()) {
                        var student_code = generate_code()
                        database.ref(`${entry_code}/students/${student_code}`).set({
                            repeat: false,
                            slow_down: false,
                            elaborate: false,
                            is_typing: false,
                        })
                        pages.active_page("student_page", student_code, entry_code)
                    } else {
                        display_code_err()
                    }
                }).catch((err) => {
                    console.log(err)
                })
            } else {
                display_code_err()
            }

        }

        function display_code_err() {
            console.log("Code does not exist")
            code_err.style.visibility = "visible"
        }
    },

    student_page: function (student_code, room_code) {

        this.create_page_div("student_page")
        const page_div = document.getElementById("student_page")

        const textarea = document.createElement("textarea")
        textarea.placeholder = "Type your notes here!"
        textarea.style.gridArea = "1 / 1 / 1 / span 3"
        page_div.appendChild(textarea)

        var btn_names = ["Repeat ⟳", "Slow down ↓", "Elaborate 🛈"]

        const btn_ids = ["repeat", "slow_down", "elaborate"]
        const btn_colors = ["orange", "bittersweet", "celestial"]

        for (i = 0; i < 3; i++) {
            var btn = document.createElement("button")
            btn.innerHTML = btn_names[i]
            btn.style.cssText = `grid-area: 2 / ${i + 1} / 2 / ${i + 1}`
            btn.id = btn_ids[i]
            btn.classList = btn_colors[i]
            page_div.appendChild(btn)
        }

        var student_ref = database.ref(`${room_code}/students/${student_code}`)

        btn_ids.forEach((e) => {

            var btn = document.getElementById(e)
            var update_obj = {}

            btn.onclick = function () {

                btn.disabled = true
                console.log(btn)
                // Property that correpsonds to button's id is set to true in student object
                // E.g., repeat: true
                update_obj[e] = true
                console.log(e, update_obj)

                student_ref.update(update_obj)

                function set_false() {

                    update_obj[e] = false
                    student_ref.update(update_obj)
                    btn.disabled = false;
                }

                setTimeout(set_false, 2000)

            }
        })

        var timer
        textarea.addEventListener("keydown", function () {

            window.clearTimeout(timer)
            student_ref.update({ is_typing: true })

            function set_typing_false() {
                student_ref.update({ is_typing: false })
            }
            timer = setTimeout(set_typing_false, 1000)

        })

        const room_disbanded = document.createElement("p")
        room_disbanded.innerHTML = "Your teacher has closed the room, but you may continue taking notes if you wish."
        room_disbanded.style.cssText = "visibility: hidden; font-size: 12px; grid-column: 1 / span 3"
        page_div.appendChild(room_disbanded)

        var room_ref = database.ref(room_code)
        room_ref.on("value", function () {
            room_ref.get().then((result) => {
                if (!(result.exists())) {
                    console.log("hello")
                    room_disbanded.style.visibility = "visible"
                }
            })
        })


        // If teacher-created room disappears, there should be some sort of notification
        window.onbeforeunload = (e) => {
            student_ref.remove()
        }

    },

    teacher_page: function () {

        this.create_page_div("teacher_page")
        const page_div = document.getElementById("teacher_page")

        const room_code = document.createElement("p")
        room_code.innerHTML = "Room Code"
        room_code.style.cssText = "margin: 0; padding: 0;"
        page_div.appendChild(room_code)

        const code = generate_code()
        const p_code = document.createElement("h1")
        p_code.style.cssText = "margin: 0"
        p_code.innerHTML = code
        page_div.appendChild(p_code)

        const room_ref = database.ref("/" + code)

        room_ref.set({
            students: {},
            code: code,
        })

        const info_arr = ["students_typing", "students_repeat", "students_slow_down", "students_elaborate"]
        const icon_arr = ["https://cdn-icons-png.flaticon.com/512/1162/1162933.png",
            "https://cdn-icons-png.flaticon.com/512/2611/2611386.png",
            "https://cdn-icons-png.flaticon.com/512/7549/7549353.png",
            "https://cdn-icons-png.flaticon.com/512/4786/4786206.png"]

        const headers = ["Typing", "Repeat", "Slower", "Elaborate"]
        const status_icons = ["https://cdn-icons-png.flaticon.com/512/8072/8072916.png", "https://cdn-icons-png.flaticon.com/512/8072/8072917.png"]
        const rgb_codes = ["rgb(110, 37, 148, 0.1)", "rgb(255, 167, 41, 0.1)", "rgb(254, 97, 92, 0.1)", "rgb(5, 142, 217, 0.1)",]

        for (i = 0; i < 4; i++) {
            var div = document.createElement("div")
            div.id = `div_${i}`
            div.style.cssText = "display: grid; grid-template-rows: 2fr 2fr 1fr; grid-template-columns: 1fr 4fr 1fr; margin: 20px; border-radius: 20px; overflow: hidden"
            div.style.backgroundColor = rgb_codes[i]
            page_div.appendChild(div)

            var img = document.createElement("img")
            img.src = icon_arr[i]
            img.style.cssText = "height: 64px; place-self: center; grid-area: 1 / 1 / span 2 / 1; margin: 20px 0 20px 20px"
            div.appendChild(img)

            var p = document.createElement("p")
            p.style.cssText = "grid-area: 2 / 2 / 2 / 2; place-self: start; margin: 0 20px"
            p.id = info_arr[i]
            div.appendChild(p)

            var color_div = document.createElement("div")
            color_div.style.cssText = "grid-area: 3 / 1 / 3 / span 3"
            color_div.id = `color_div${i}`
            div.appendChild(color_div)

            var header = document.createElement("h3")
            header.innerHTML = headers[i]
            header.style.cssText = "grid-area: 1 / 2 / 1 / 2; place-self: end start; margin: 5px 20px"
            div.appendChild(header)

            var status_icon = document.createElement("img")
            status_icon.style.cssText = "height: 48px; align-self: center; grid-area: 1 / 3 / span 2 / 3"
            status_icon.id = `status_icon${i}`
            div.appendChild(status_icon)
        }

        function status_switch(id_num, bCheck) {
            var status_icon = document.getElementById(`status_icon${id_num}`)
            var color_div = document.getElementById(`color_div${id_num}`)
            if (bCheck) {
                status_icon.src = status_icons[0]
                color_div.classList = "emerald"
            } else {
                status_icon.src = status_icons[1]
                color_div.classList = "bittersweet"
                console.log(status_icon.src, color_div.classList)
            }

        }

        const no_students = document.createElement("p")
        no_students.innerHTML = "No students are connected."
        page_div.appendChild(no_students)

        room_ref.on('value', (snapshot) => {
            room_ref.child("students").get().then((result) => {

                if (result.exists()) {

                    var room_obj = snapshot.val()
                    var student_obj = room_obj["students"]
                    var total_students = Object.keys(student_obj).length
                    var students_typing = students_repeat = students_slow_down = students_elaborate = 0

                    for (i = 0; i < 4; i++) {
                        document.getElementById(`div_${i}`).style.display = "grid"
                        status_switch(i, true)
                    }

                    for (student in student_obj) {
                        if (student_obj[student]["is_typing"]) {
                            students_typing = + 1
                            status_switch(0, false)
                        }
                    }

                    for (student in student_obj) {
                        if (student_obj[student]["repeat"]) {
                            students_repeat = + 1
                            status_switch(1, false)
                        }
                    }

                    for (student in student_obj) {
                        if (student_obj[student]["slow_down"]) {
                            students_slow_down = + 1
                            status_switch(2, false)
                        }
                    }

                    for (student in student_obj) {
                        if (student_obj[student]["elaborate"]) {
                            students_elaborate = + 1
                            status_switch(3, false)
                        }
                    }

                    no_students.style.display = "none"

                    document.getElementById("students_typing").innerHTML = `${students_typing}/${total_students} students are typing`
                    document.getElementById("students_elaborate").innerHTML = `${students_elaborate}/${total_students} students want you to elaborate`
                    document.getElementById("students_slow_down").innerHTML = `${students_slow_down}/${total_students} want you to slow down`
                    document.getElementById("students_repeat").innerHTML = `${students_repeat}/${total_students} want you to repeat yourself`

                } else {

                    for (i = 0; i < 4; i++) {
                        document.getElementById(`div_${i}`).style.display = "none"
                    }

                    no_students.style.display = "grid"

                }
            })
        })

        window.onbeforeunload = (e) => {
            room_ref.remove()
        }

    },

}

pages.active_page("start_page")