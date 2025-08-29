import{f as n}from"./index-Dc4E0O40.js";function _(a){const t=Object.prototype.toString.call(a);return a instanceof Date||typeof a=="object"&&t==="[object Date]"?new a.constructor(+a):typeof a=="number"||t==="[object Number]"||typeof a=="string"||t==="[object String]"?new Date(a):new Date(NaN)}function u(a,t){return a instanceof Date?new a.constructor(t):new Date(t)}function d(a,t){const e=_(a);return isNaN(t)?u(a,NaN):(e.setDate(e.getDate()+t),e)}function p(a,t){return d(a,-1)}class f{async getFriends(t){try{const{data:e,error:r}=await n.from("user_connections").select(`
          *,
          friend_profile:user_profiles!friend_id(
            username,
            avatar_url,
            sport,
            sport_position,
            level,
            is_online,
            last_seen
          )
        `).eq("user_id",t).eq("status","accepted").order("updated_at",{ascending:!1});if(r)throw r;return e||[]}catch(e){throw console.error("Error fetching friends:",e),e}}async searchUsers(t,e){try{const{data:r,error:s}=await n.from("user_profiles").select(`
          id,
          username,
          avatar_url,
          sport,
          sport_position,
          level,
          is_online
        `).ilike("username",`%${t}%`).neq("id",e).limit(20);if(s)throw s;return(r||[]).map(o=>({id:"",user_id:e,friend_id:o.id,status:"pending",created_at:"",updated_at:"",friend_profile:{username:o.username,avatar_url:o.avatar_url,sport:o.sport,sport_position:o.sport_position,level:o.level,is_online:o.is_online}}))}catch(r){throw console.error("Error searching users:",r),r}}async sendFriendRequest(t,e){try{const{error:r}=await n.from("user_connections").insert({user_id:t,friend_id:e,status:"pending"});if(r)throw r;return!0}catch(r){return console.error("Error sending friend request:",r),!1}}async acceptFriendRequest(t){try{const{error:e}=await n.from("user_connections").update({status:"accepted",updated_at:new Date().toISOString()}).eq("id",t);if(e)throw e;return!0}catch(e){return console.error("Error accepting friend request:",e),!1}}async getChallenges(t,e,r,s=20){try{let o=n.from("challenges").select(`
          *,
          creator_profile:user_profiles!creator_id(
            username,
            avatar_url,
            sport
          )
        `).eq("is_active",!0).order("created_at",{ascending:!1}).limit(s);t&&(o=o.eq("pillar",t)),e&&(o=o.eq("difficulty",e)),r&&(o=o.eq("challenge_type",r));const{data:i,error:c}=await o;if(c)throw c;return i||[]}catch(o){throw console.error("Error fetching challenges:",o),o}}async joinChallenge(t,e){try{const{error:r}=await n.from("challenge_participations").insert({challenge_id:t,user_id:e,current_progress:0,completion_percentage:0,points_earned:0});if(r)throw r;return!0}catch(r){return console.error("Error joining challenge:",r),!1}}async createChallenge(t,e){try{const{data:r,error:s}=await n.from("challenges").insert({creator_id:t,...e,is_active:!0,participants_count:1}).select("id").single();if(s)throw s;return await this.joinChallenge(r.id,t),r.id}catch(r){return console.error("Error creating challenge:",r),null}}async getUserChallenges(t){try{const{data:e,error:r}=await n.from("challenge_participations").select(`
          *,
          challenge:challenges(
            *,
            creator_profile:user_profiles!creator_id(
              username,
              avatar_url,
              sport
            )
          )
        `).eq("user_id",t).order("created_at",{ascending:!1});if(r)throw r;const s=e||[],o=[],i=[];return s.forEach(c=>{const l={...c.challenge,...c};c.completed_at?i.push(l):o.push(l)}),{active:o,completed:i}}catch(e){return console.error("Error fetching user challenges:",e),{active:[],completed:[]}}}async getLeaderboard(t="global",e,r,s=50){try{const o=[{user_id:"1",username:"Rugby_Beast_33",avatar_url:"/avatars/user1.jpg",sport:"rugby",sport_position:"pilier",level:15,total_points:24500,weekly_points:1200,monthly_points:4800,challenges_completed:47,current_streak:12,rank:1,change_from_last_week:2},{user_id:"2",username:"FitNinja_Pro",avatar_url:"/avatars/user2.jpg",sport:"basketball",sport_position:"meneur",level:13,total_points:22100,weekly_points:980,monthly_points:4200,challenges_completed:39,current_streak:8,rank:2,change_from_last_week:-1},{user_id:"3",username:"Marathon_Queen",avatar_url:"/avatars/user3.jpg",sport:"running",level:14,total_points:21800,weekly_points:1100,monthly_points:4500,challenges_completed:52,current_streak:15,rank:3,change_from_last_week:1}];return t==="sport"&&e?o.filter(i=>i.sport===e):o.slice(0,s)}catch(o){return console.error("Error fetching leaderboard:",o),[]}}async getSocialFeed(t,e="friends",r=20){try{return[{id:"1",user_id:"2",content:"Nouveau PR au développé couché ! 120kg x5 reps 💪 Les entraînements payent enfin !",post_type:"achievement",achievements:[{type:"bench_press_pr",value:120,unit:"kg",milestone:!0}],likes_count:23,comments_count:8,shares_count:3,created_at:new Date().toISOString(),author_profile:{username:"FitNinja_Pro",avatar_url:"/avatars/user2.jpg",sport:"basketball",level:13},is_liked:!1,is_bookmarked:!1},{id:"2",user_id:"1",content:"Session mêlée ce matin avec l'équipe. Ready pour le match de samedi ! 🏉",post_type:"workout",workout_data:{duration:90,exercises:["Mêlée","Scrum","Poussée traîneau"],calories_burned:650},likes_count:18,comments_count:5,shares_count:1,created_at:p(new Date,1).toISOString(),author_profile:{username:"Rugby_Beast_33",avatar_url:"/avatars/user1.jpg",sport:"rugby",level:15},is_liked:!0,is_bookmarked:!1}].slice(0,r)}catch(s){return console.error("Error fetching social feed:",s),[]}}async createPost(t,e){try{const{data:r,error:s}=await n.from("social_posts").insert({user_id:t,...e,likes_count:0,comments_count:0,shares_count:0}).select("id").single();if(s)throw s;return r.id}catch(r){return console.error("Error creating post:",r),null}}async likePost(t,e){try{const{error:r}=await n.from("post_likes").insert({post_id:t,user_id:e});if(r)throw r;return!0}catch(r){return console.error("Error liking post:",r),!1}}async getSocialStats(t){try{return{friends_count:24,followers_count:156,following_count:89,total_posts:45,total_likes_received:892,total_challenges_created:8,total_challenges_completed:23,community_rank:47,sport_rank:12,influence_score:78}}catch(e){throw console.error("Error fetching social stats:",e),e}}async getFriendsComparison(t,e="week"){try{return{user_stats:{workouts_completed:5,total_calories_burned:2800,water_intake_liters:14.5,sleep_hours_avg:7.2,challenges_completed:2},friends_stats:[{user_id:"1",username:"Rugby_Beast_33",workouts_completed:6,total_calories_burned:3200,water_intake_liters:16.8,sleep_hours_avg:8.1,challenges_completed:3},{user_id:"2",username:"FitNinja_Pro",workouts_completed:4,total_calories_burned:2400,water_intake_liters:12.3,sleep_hours_avg:6.8,challenges_completed:1}],user_rank:2}}catch(r){throw console.error("Error fetching friends comparison:",r),r}}async getSocialNotifications(t){try{return{friend_requests:[],challenge_invites:[],mentions:[],achievements:[]}}catch(e){return console.error("Error fetching social notifications:",e),{friend_requests:[],challenge_invites:[],mentions:[],achievements:[]}}}}const m=new f;export{m as s};
//# sourceMappingURL=socialService-DanDjTUL.js.map
