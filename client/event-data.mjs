// Authored Vietnamese game dialogue. All mechanical effects are explicit data.
const result=(text,coins=0,trust=0,traffic=1,later=null)=>({text,coins,trust,traffic,later});
const choice=(id,label,outcome,cost=0)=>({id,label,outcome,cost});
const next=(id,label,node)=>({id,label,next:node,cost:0});
const later=(text,coins=0,trust=0)=>({text,coins,trust});
const node=(text,...choices)=>({text,choices});
const entries=[
  {id:'fight',title:'Chuyện bất bình',asset:'Argument',day:2,nodes:{
    start:node('Hai người cãi nhau vì va xe, rồi bắt đầu xô đẩy trước quán.',
      choice('a','Bênh người áo đỏ',result('Bạn bị cuốn vào cuộc cãi vã. Một chiếc ghế gãy, khách ngại ghé quán.',-4,-2,.8)),
      choice('b','Bênh người áo xanh',result('Chưa rõ đầu đuôi, bạn đã chọn phe. Quán mất khách và phải dọn đồ vỡ.',-4,-2,.8)),
      choice('police','Gọi công an',result('Bạn báo sự việc từ trong quán. Mọi người tách ra; con phố yên trở lại.',0,2)),
      next('mediate','Đề nghị nói chuyện bình tĩnh','talk')),
    talk:node('Cả hai chịu lùi lại, nhưng vẫn đòi người kia xin lỗi.',
      choice('listen','Nghe cả hai kể',result('Một hiểu lầm được gỡ ra. Họ cùng dựng xe rồi bắt tay.',0,3,1.15)),
      choice('help','Nhờ người phụ trách khu phố',result('Có người đứng ra hòa giải. Quán không còn bị chắn lối.',0,1))) }},
  {id:'racing',title:'Tiếng máy ngoài đường',asset:'Scooter',day:2,nodes:{
    start:node('Hai xe máy rú ga, chạy đua ngang quán. Khách giật mình.',
      choice('report','Báo lực lượng tuần tra',result('Bạn báo từ trong quán. Đoạn đường dần yên, khách cảm thấy an tâm.',0,2)),
      choice('shelter','Mời khách ngồi xa mép đường',result('Mọi người tránh được bụi và tiếng ồn. Quán vắng một lát.',0,1,.8)),
      choice('cheer','Hò reo cổ vũ',result('Một chiếc gương bị quệt vỡ. Cổ vũ lần này chẳng vui như bạn nghĩ.',-5,-3,.8))) }},
  {id:'parking',title:'Chiếc xe chắn quán',asset:'Car',day:1,nodes:{
    start:node('Một chiếc ô tô đỗ ngay trước lối vào. Tài xế nói: “Cho tôi năm phút nhé?”',
      choice('move','Nhờ chuyển xe sang chỗ trống',result('Tài xế xin lỗi và chuyển xe. Lối vào thông thoáng.',0,1,1,later('Người tài xế quay lại mua nước cho đồng nghiệp. Bạn nhận thêm 5 xu.',5,1))),
      choice('wait','Cho đỗ một lát',result('Xe rời đi sau một lúc. Vài khách đã đi qua vì không thấy lối vào.',0,0,.8)),
      choice('attendant','Nhờ người trông xe hướng dẫn',result('Xe được đưa về đúng chỗ, không ai phải tranh cãi.',0,1))) }},
  {id:'girl',title:'Em bé lạc đường',asset:'Girl',day:1,nodes:{
    start:node('Một bé gái đeo ba lô đứng gần quán: “Cô chú ơi, cháu không thấy mẹ đâu.”',
      choice('family','Đợi ở quán, liên hệ người nhà',result('Bé ngồi ở chỗ dễ nhìn thấy, cạnh quầy. Bạn liên hệ được gia đình.',0,2,1,later('Mẹ bé ghé cảm ơn và đặt nước cho cả nhà.',4,1))),
      choice('local','Nhờ cán bộ khu phố hỗ trợ',result('Bạn ở lại cùng bé trong lúc người phụ trách hỗ trợ tìm gia đình.',0,2,1,later('Gia đình báo bé đã về nhà an toàn. Hàng xóm rất quý cách bạn giúp đỡ.',0,2)))) }},
  {id:'payment',title:'Ảnh chuyển khoản',asset:'PhoneGuest',day:2,nodes:{
    start:node('Một người đưa ảnh chuyển khoản để nhận tiền thừa. Điện thoại quán chưa báo giao dịch.',
      next('check','Kiểm tra giao dịch của quán','receipt'),
      choice('accept','Tin ảnh, trả tiền thừa',[
        result('Giao dịch thật đến muộn. Bạn không mất tiền, nhưng lần này khá hồi hộp.'),
        result('Ảnh đã bị sửa. Người kia đi mất cùng tiền thừa.',-6,-1)]),
      choice('decline','Chưa nhận được tiền thì chưa trả',result('Bạn giữ nguyên tiền quán và mời khách chờ xác nhận.'))),
    receipt:node(['Giao dịch vừa hiện đúng số tiền và tên người gửi.','Không có giao dịch. Thời gian trên ảnh cũng không khớp.'],
      choice('verified','Xử lý theo giao dịch đã xác minh',[
        result('Bạn trả đúng tiền thừa. Người khách cảm ơn vì đã kiểm tra cẩn thận.',0,1),
        result('Bạn từ chối khoản hoàn không có thật. Người kia lặng lẽ rời đi.',0,1)])) }},
  {id:'meal',title:'Một bữa ăn',asset:'Visitor',day:1,nodes:{
    start:node('Một người xin giúp tiền ăn. Bạn chưa biết hoàn cảnh của họ.',
      choice('food','Mời một suất ăn · 2 xu',[
        result('Người khách ăn chậm rãi rồi cảm ơn. Một bữa ăn nhỏ đã giúp họ qua buổi trưa.',0,2),
        result('Họ chỉ muốn tiền, nhưng bạn để suất ăn ở bàn chia sẻ. Một người cần nó đã nhận.',0,1)],2),
      choice('kitchen','Giới thiệu bếp ăn cộng đồng',[
        result('Họ hỏi kỹ đường tới bếp ăn rồi cảm ơn bạn.',0,1),
        result('Họ không muốn tới bếp ăn và bỏ đi. Bạn không kết luận chỉ từ vẻ ngoài.')]),
      choice('cash','Giúp 3 xu',[
        result('Người khách mua một phần cơm ở quầy bên cạnh.',0,1,1,later('Người từng được giúp mang rau nhà trồng đến biếu quán.',3,1)),
        result('Bạn thấy họ tiếp tục kể một câu chuyện khác ở quán bên. Lần sau bạn sẽ hỏi rõ hơn.')],3)) }},
  {id:'alert-dog',title:'Vị khách đang hoảng',asset:'Dog',day:2,nodes:{
    start:node('Một chú chó lạ gầm gừ ở lối vào. Có vẻ nó đang sợ và không muốn ai đến gần.',
      choice('gate','Khép cổng, giữ khoảng cách',result('Lối vào yên lại khi chú chó tự đi ra. Quán chậm khách một lát.',0,1,.8)),
      choice('handler','Nhờ người có kinh nghiệm hỗ trợ',result('Người chăm sóc tới đón nó. Không ai bị thương.',0,2)),
      choice('space','Để trống lối ra, không áp sát',result('Có đường thoát, chú chó lùi khỏi quán rồi chạy về phía chủ.',0,1))) }},
  {id:'friendly-dog',title:'Đuôi vẫy trước cửa',asset:'Dog',day:1,nodes:{
    start:node('Một chú chó thân thiện ngồi trước cửa, nhìn bạn rồi vẫy đuôi lia lịa.',
      choice('chew','Tặng đồ gặm hình xương · 1 xu',result('Chú chó ôm món đồ chơi dành cho chó, vui đến mức suýt ngồi lên chân mình.',0,1,1,later('Chủ chú chó ghé cảm ơn và mua nước. Bạn nhận 3 xu.',3,1)),1),
      choice('owner','Xem thẻ tên, tìm chủ',result('Chủ của nó đang tìm ngay góc phố. Một cuộc đoàn tụ đầy tiếng sủa vui.',0,2)),
      choice('rest','Cho nằm nghỉ ngoài hiên',result('Chú chó nằm gọn bên hiên, không chắn lối vào.',0,1))) }},
  {id:'cat',title:'Món quà lấp lánh',asset:'Cat',day:1,nodes:{
    start:node('Một chú mèo đặt vật sáng lấp lánh trước quán, rồi nhìn bạn đầy tự hào.',
      next('inspect','Xem món quà','shiny'),
      choice('keep','Cất làm của riêng',[
        result('Đó là một chiếc nhẫn. Người hàng xóm đi tìm cả buổi.',0,-2,1,later('Chủ chiếc nhẫn nhận ra nó ở quán. Bạn trả lại và mất lòng tin.',-3,-2)),
        result('Kho báu hóa ra là nắp chai. Chú mèo vẫn rất hài lòng.')])),
    shiny:node(['Đó là một chiếc nhẫn có khắc tên ở mặt trong.','Đó là một nắp chai sáng bóng, không phải trang sức.'],
      choice('return','Giữ hộ, tìm người đánh rơi',[
        result('Bạn ghi nhận đồ thất lạc và cất cẩn thận.',0,2,1,later('Chủ chiếc nhẫn đến nhận, gửi quán 5 xu cảm ơn.',5,1)),
        result('Bạn dọn nắp chai khỏi lối đi. Chú mèo nhận một lời cảm ơn trang trọng.',0,1)])) }},
  {id:'music',title:'Một bài ngoài hiên',asset:'Musician',day:2,nodes:{
    start:node('Một bạn ôm đàn hỏi: “Mình hát một bài nhẹ nhàng được không?”',
      choice('welcome','Mời hát một bài',result('Tiếng đàn vừa đủ nghe. Người đi đường ghé lại uống nước.',0,1,1.15)),
      choice('sponsor','Góp 2 xu cho tiết mục',result('Bạn ấy hát một bài tự viết về ly trà bị quên đá. Khách bật cười.',0,2,1.15),2),
      choice('quiet','Xin giữ yên tĩnh',result('Bạn ấy vui vẻ chuyển sang khoảng sân bên kia.'))) }},
  {id:'parcel',title:'Thùng hàng nhầm địa chỉ',asset:'Parcel',day:1,nodes:{
    start:node('Một thùng hàng được để trước quán. Tên trên nhãn không phải tên bạn.',
      choice('return','Gọi người giao hàng quay lại',result('Thùng hàng về đúng địa chỉ.',0,1,1,later('Chủ gói hàng ghé cảm ơn bằng một đơn nước nhỏ.',3,1))),
      choice('hold','Giữ nguyên, chờ người nhận',result('Người nhận chạy tới, thở phào khi thấy thùng còn nguyên.',0,1)),
      choice('open','Mở xem bên trong',result('Bên trong là mô hình dễ vỡ. Bạn phải góp tiền sửa vì mở sai cách.',-3,-1))) }},
  {id:'umbrella',title:'Chiếc ô bướng bỉnh',asset:'Umbrella',day:2,nodes:{
    start:node('Một cơn gió lật ngược chiếc ô bên hiên. Nó trông như cái bát khổng lồ.',
      choice('secure','Thu ô, cất đồ lỏng lẻo',result('Mọi thứ được cất gọn. Một bác khách đùa: “Suýt có trà đá bay!”',0,1)),
      choice('inside','Mời khách tránh xa chiếc ô',result('Khách chuyển vào phía trong. Bạn thu ô khi gió dịu.',0,1,.8))) }},
  {id:'review',title:'Năm sao có giá',asset:'PhoneGuest',day:3,nodes:{
    start:node('Một người tự xưng nổi tiếng hứa đánh giá năm sao nếu bạn trả 5 xu.',
      choice('honest','Mời dùng thử, đánh giá thật',result('Một ly ngon và thái độ chân thành khiến khách thật ghé thêm.',0,2,1.15)),
      choice('no','Từ chối mua đánh giá',result('Bạn giữ tiền và tiếp tục chăm khách đang đợi.',0,1)),
      choice('pay','Trả 5 xu',result('Bài khen sao chép bị hàng xóm nhận ra. Quán mất uy tín.',0,-3),5)) }},
  {id:'chess',title:'Một nước cờ thôi',asset:'Chess',day:2,nodes:{
    start:node('Một bác mang bàn cờ tới: “Cháu thử tìm nước hay xem nào.”',
      choice('play','Thử một nước',[
        result('Bác bật cười: “Khá lắm!” rồi thưởng bạn 2 xu.',2,1),
        result('Bạn mắc bẫy một nước. Bác chỉ lại rất vui vẻ.',0,1,1,later('Bác quay lại cùng bạn cờ. Quán có thêm một đơn 3 xu.',3))]),
      choice('watch','Mời bác chơi cùng khách',result('Hai bác ngồi chơi, thỉnh thoảng quên cả lượt vì chuyện trò.',0,1,1.15))) }},
];
export const EVENTS=Object.freeze(Object.assign(Object.create(null),Object.fromEntries(entries.map(e=>[e.id,e]))));
export const EVENT_IDS=Object.freeze(entries.map(e=>e.id));
export const PORTRAITS=Object.freeze([...new Set(entries.map(e=>e.asset)),'CatCap','DogChew']);
export const variantValue=(value,variant)=>Array.isArray(value)?value[variant%value.length]:value;
